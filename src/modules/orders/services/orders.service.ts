import { ordersRepository, type OrdersRepository } from "../repository/orders.repository";
import { cartRepository } from "../../cart/repository/cart.repository";
import { addressesRepository } from "../../addresses/repository/addresses.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { prisma } from "../../../lib/prisma";
import { generateOrderNumber } from "../../../utils/orderNumber";
import { notificationTriggersService } from "../../notifications/services/notifications-triggers.service";
import { logger } from "../../../lib/logger";
import type { CheckoutInput } from "../dto";
import type { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";
import { ordersMapper } from "../mapper/orders.mapper";
import { type OrderWithRelations } from "../lib/type/orders.type";
import { ORDER_STATUS_FROM_API, PAYMENT_METHOD_FROM_API } from "../lib/constant/orders.constant";
import { computeShippingCost } from "../lib/helper/orders.helper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class OrdersService {
    constructor(private readonly repository: OrdersRepository) { }

    public async checkout(userId: string, input: CheckoutInput) {
        const cartItems = await cartRepository.findByUser(userId);
        if (cartItems.length === 0) {
            throw new BadRequestError("Votre panier est vide.");
        }
        if (cartItems.some((item) => item.product.ownerId === userId)) {
            throw new ForbiddenError("Vous ne pouvez pas acheter vos propres produits.");
        }

        // ─── 1. Résolution de l'adresse de livraison (snapshot) ───
        let shipping: {
            shippingFullName: string;
            shippingPhone: string;
            shippingEmail: string;
            shippingProvince: ProvinceMadagascar;
            shippingRegion: RegionMadagascar;
            shippingCity: string;
            shippingNeighborhood?: string;
            shippingAddress: string;
            shippingNotes?: string;
        };

        if (input.addressId) {
            const address = await addressesRepository.findById(input.addressId);
            if (!address || address.userId !== userId) {
                throw new NotFoundError("Adresse");
            }
            shipping = {
                shippingFullName: address.fullName,
                shippingPhone: address.phone,
                shippingEmail: address.email ?? "",
                shippingProvince: address.province,
                shippingRegion: address.region,
                shippingCity: address.city,
                shippingNeighborhood: address.neighborhood ?? undefined,
                shippingAddress: address.address,
                shippingNotes: address.notes ?? undefined,
            };
        } else {
            shipping = {
                shippingFullName: input.shipping!.fullName,
                shippingPhone: input.shipping!.phone,
                shippingEmail: input.shipping!.email,
                shippingProvince: input.shipping!.province,
                shippingRegion: input.shipping!.region,
                shippingCity: input.shipping!.city,
                shippingNeighborhood: input.shipping!.neighborhood,
                shippingAddress: input.shipping!.address,
                shippingNotes: input.shipping!.notes,
            };
        }

        // ─── 2. Calcul des totaux côté serveur ───
        const subtotal = cartItems.reduce(
            (sum, item) => sum + item.quantity * (item.product.price ?? 0),
            0
        );

        const { cost: shippingCost, zoneId } = await computeShippingCost({
            province: shipping.shippingProvince,
            region: shipping.shippingRegion,
            subtotal,
            deliveryMode: input.deliveryMode,
        });

        const total = subtotal + shippingCost;

        // ─── 3. Validation du point relais si PICKUP_POINT ───
        if (input.deliveryMode === "PICKUP_POINT" && input.pickupPointId) {
            const pickup = await prisma.pickupPoint.findUnique({
                where: { id: input.pickupPointId },
                select: { id: true, isActive: true },
            });
            if (!pickup || !pickup.isActive) {
                throw new NotFoundError("Point relais");
            }
        }

        // ─── 4. Statut initial selon mode de paiement ───
        const paymentMethod = PAYMENT_METHOD_FROM_API[input.paymentMethod];
        if (!paymentMethod) {
            throw new BadRequestError("Méthode de paiement invalide.");
        }

        const isCOD = input.paymentMethod === "cash";
        const initialStatus = isCOD ? "COD_PENDING" : "PAID";
        const transactionStatus = isCOD ? "PENDING" : "SUCCESS";

        // ─── 5. Création de la commande ───
        try {
            const order = await this.repository.createOrderTransactional({
                userId,
                orderNumber: generateOrderNumber(),
                items: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceSnapshot: item.product.price ?? 0,
                    titleSnapshot: item.product.title,
                    imageSnapshot: item.product.images[0]?.url ?? null,
                    skuSnapshot: item.product.sku,
                    colorSnapshot: item.color?.label ?? null,
                    sizeSnapshot: item.size?.value ?? null,
                })),
                shipping,
                deliveryMode: input.deliveryMode,
                shippingZoneId: zoneId,
                shippingPickupPointId: input.pickupPointId,
                deliveryLatitude: input.deliveryLatitude,
                deliveryLongitude: input.deliveryLongitude,
                deliveryAccuracy: input.deliveryAccuracy,
                paymentMethod,
                subtotal,
                shippingCost,
                total,
                initialStatus,
                transactionStatus,
                codAmountExpected: isCOD ? total : undefined,
            });

            logger.info(
                { userId, orderId: order.id, total },
                "Commande créée"
            );

            return ordersMapper.toOutput(order as unknown as OrderWithRelations);
        } catch (err) {
            if (
                err instanceof Error &&
                err.message.startsWith("STOCK_INSUFFICIENT:")
            ) {
                const productId = err.message.split(":")[1];
                throw new ConflictError(
                    "Le stock de certains articles a changé entre-temps.",
                    { productId }
                );
            }
            throw err;
        }
    }

    public async list(userId: string, page?: number, limit?: number) {
        const pagination = normalizePagination(page, limit);
        const [orders, totalItems] = await this.repository.findManyByUser(
            userId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );
        return buildPaginatedResult(ordersMapper.toOutputList(orders), totalItems, pagination);
    }

    public async getById(userId: string, orderId: string) {
        const order = await this.assertOwnership(orderId, userId);
        return ordersMapper.toOutput(order as unknown as OrderWithRelations);
    }

    public async cancel(userId: string, orderId: string) {
        const order = await this.assertOwnership(orderId, userId);

        if (order.status === "SHIPPED" || order.status === "DELIVERED") {
            throw new ConflictError(
                "Une commande déjà expédiée ou livrée ne peut plus être annulée."
            );
        }
        if (order.status === "CANCELLED") {
            throw new ConflictError("Cette commande est déjà annulée.");
        }

        await this.repository.restoreStock(orderId);
        const updated = await this.repository.updateStatus(orderId, "CANCELLED");
        return ordersMapper.toOutput(updated as unknown as OrderWithRelations);
    }

    public async adminUpdateStatus(orderId: string, statusApi: string) {
        const order = await this.repository.findById(orderId);
        if (!order) throw new NotFoundError("Commande");

        const statusKey = statusApi.toLowerCase().replaceAll("_", "-");
        const nextStatus =
            ORDER_STATUS_FROM_API[statusApi] ?? ORDER_STATUS_FROM_API[statusKey];
        if (!nextStatus) {
            throw new BadRequestError("Statut de commande invalide.");
        }

        // Timestamp automatique selon le statut
        const extra: Record<string, Date> = {};
        if (nextStatus === "PAID") extra.paidAt = new Date();
        if (nextStatus === "SHIPPED") extra.shippedAt = new Date();
        if (nextStatus === "DELIVERED") extra.deliveredAt = new Date();
        if (nextStatus === "CANCELLED") extra.cancelledAt = new Date();
        if (nextStatus === "REFUNDED") extra.refundedAt = new Date();

        const updated = await this.repository.updateStatus(
            orderId,
            nextStatus,
            extra
        );

        // Notifications transactionnelles
        if (nextStatus === "SHIPPED") {
            await notificationTriggersService
                .notifyOrderShipped(updated as unknown as OrderWithRelations)
                .catch((err) =>
                    logger.error(
                        { err, orderId },
                        "Échec notification d'expédition"
                    )
                );
        }
        if (nextStatus === "DELIVERED") {
            await notificationTriggersService
                .notifyOrderDelivered(updated as unknown as OrderWithRelations)
                .catch((err) =>
                    logger.error({ err, orderId }, "Échec notification de livraison")
                );
        }

        return ordersMapper.toOutput(updated as unknown as OrderWithRelations);
    }

    private async assertOwnership(orderId: string, userId: string) {
        const order = await this.repository.findById(orderId);
        if (!order) throw new NotFoundError("Commande");
        if (order.userId !== userId) {
            throw new ForbiddenError("Cette commande ne vous appartient pas.");
        }
        return order;
    }
}

export const ordersService = new OrdersService(ordersRepository);
