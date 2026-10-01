import { prisma } from "../../../lib/prisma";
import type { OrderStatus, Prisma } from "@prisma/client";
import { orderDetailInclude } from "../lib/constant/orders.constant";
import { type CheckoutParams } from "../lib/type/orders.type";

// ─────────────────────────────────────────────────────────────────────────────
// REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export class OrdersRepository {
    findManyByUser(userId: string, skip: number, take: number) {
        return prisma.$transaction([
            prisma.order.findMany({
                where: { userId },
                include: orderDetailInclude,
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.order.count({ where: { userId } }),
        ]);
    }

    findById(id: string) {
        return prisma.order.findUnique({ where: { id }, include: orderDetailInclude });
    }

    /**
     * Crée la commande complète en une transaction :
     *   - Décrémente le stock (avec vérification anti-survente)
     *   - Crée la commande + ses items + la transaction
     *   - Crée les settlements vendeurs
     *   - Vide le panier
     */
    createOrderTransactional(params: CheckoutParams) {
        return prisma.$transaction(async (tx) => {
            // 1. Décrément du stock avec vérification
            for (const item of params.items) {
                const updateResult = await tx.product.updateMany({
                    where: { id: item.productId, stock: { gte: item.quantity } },
                    data: { stock: { decrement: item.quantity } },
                });
                if (updateResult.count === 0) {
                    throw new Error(`STOCK_INSUFFICIENT:${item.productId}`);
                }
            }

            // 2. Création de la commande
            const order = await tx.order.create({
                data: {
                    orderNumber: params.orderNumber,
                    userId: params.userId,
                    status: params.initialStatus,
                    paymentMethod: params.paymentMethod,
                    currency: "MGA",

                    // Livraison
                    deliveryMode: params.deliveryMode,
                    shippingFullName: params.shipping.shippingFullName,
                    shippingPhone: params.shipping.shippingPhone,
                    shippingEmail: params.shipping.shippingEmail,
                    shippingProvince: params.shipping.shippingProvince,
                    shippingRegion: params.shipping.shippingRegion,
                    shippingCity: params.shipping.shippingCity,
                    shippingNeighborhood: params.shipping.shippingNeighborhood,
                    shippingAddress: params.shipping.shippingAddress,
                    shippingNotes: params.shipping.shippingNotes,

                    // Zone / point relais
                    shippingZoneId: params.shippingZoneId,
                    shippingPickupPointId: params.shippingPickupPointId,

                    // GPS
                    deliveryLatitude: params.deliveryLatitude,
                    deliveryLongitude: params.deliveryLongitude,
                    deliveryAccuracy: params.deliveryAccuracy,
                    deliveryGpsSharedAt:
                        params.deliveryLatitude !== undefined ? new Date() : undefined,

                    // Financier
                    subtotal: params.subtotal,
                    shippingCost: params.shippingCost,
                    total: params.total,
                    codAmountExpected: params.codAmountExpected,

                    // Items
                    items: {
                        create: params.items.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            priceSnapshot: i.priceSnapshot,
                            titleSnapshot: i.titleSnapshot,
                            imageSnapshot: i.imageSnapshot,
                            skuSnapshot: i.skuSnapshot,
                            colorSnapshot: i.colorSnapshot ?? null,
                            sizeSnapshot: i.sizeSnapshot ?? null,
                        })),
                    },

                    // Transaction
                    transactions: {
                        create: [
                            {
                                amount: params.total,
                                method: params.paymentMethod,
                                status: params.transactionStatus,
                                idempotencyKey: crypto.randomUUID(),
                            },
                        ],
                    },
                },
                include: orderDetailInclude,
            });

            // 3. Création des settlements vendeurs
            const owners = await tx.orderItem.findMany({
                where: { orderId: order.id },
                include: { product: { select: { ownerId: true } } },
            });

            const bySeller = new Map<string, number>();
            for (const item of owners) {
                if (item.product.ownerId) {
                    bySeller.set(
                        item.product.ownerId,
                        (bySeller.get(item.product.ownerId) ?? 0) +
                        item.quantity * item.priceSnapshot
                    );
                }
            }

            for (const [sellerId, grossAmount] of bySeller) {
                const contract = await tx.sellerContract.findFirst({
                    where: {
                        sellerId,
                        status: "APPROVED",
                        AND: [
                            {
                                OR: [
                                    { effectiveFrom: null },
                                    { effectiveFrom: { lte: order.createdAt } },
                                ],
                            },
                            {
                                OR: [
                                    { effectiveTo: null },
                                    { effectiveTo: { gt: order.createdAt } },
                                ],
                            },
                        ],
                    },
                    orderBy: { version: "desc" },
                });

                const commissionAmount = contract
                    ? contract.type === "PERCENTAGE"
                        ? Math.round((grossAmount * contract.value) / 100)
                        : Math.min(grossAmount, contract.value)
                    : 0;

                await tx.sellerSettlement.create({
                    data: {
                        orderId: order.id,
                        sellerId,
                        contractId: contract?.id,
                        contractVersion: contract?.version,
                        grossAmount,
                        commissionAmount,
                        netAmount: grossAmount - commissionAmount,
                        status: contract ? "READY" : "PENDING_REVIEW",
                        reviewNote: contract
                            ? null
                            : "Aucun contrat actif au moment de la commande.",
                    },
                });
            }

            // 4. Vider le panier
            await tx.cartItem.deleteMany({ where: { userId: params.userId } });

            return order;
        });
    }

    updateStatus(id: string, status: OrderStatus, extra?: Prisma.OrderUpdateInput) {
        return prisma.order.update({
            where: { id },
            data: { status, ...extra },
            include: orderDetailInclude,
        });
    }

    /** Restaure le stock des articles d'une commande annulée. */
    restoreStock(orderId: string) {
        return prisma.$transaction(async (tx) => {
            const items = await tx.orderItem.findMany({ where: { orderId } });
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }
        });
    }
}

export const ordersRepository = new OrdersRepository();
