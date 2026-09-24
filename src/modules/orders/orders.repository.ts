import { prisma } from "../../lib/prisma";
import type { OrderStatus, PaymentMethod, Prisma, TransactionStatus } from "@prisma/client";

export const orderDetailInclude = {
  items: true,
  transactions: { orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.OrderInclude;

export const ordersRepository = {
  findManyByUser: (userId: string, skip: number, take: number) =>
    prisma.$transaction([
      prisma.order.findMany({
        where: { userId },
        include: orderDetailInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.order.count({ where: { userId } }),
    ]),

  findById: (id: string) => prisma.order.findUnique({ where: { id }, include: orderDetailInclude }),

  /**
   * Crée la commande, ses lignes, la transaction associée, décrémente le
   * stock et vide le panier — le tout dans une seule transaction Prisma
   * pour garantir la cohérence (soit tout réussit, soit rien n'est appliqué).
   */
  createOrderTransactional: (params: {
    userId: string;
    items: { productId: string; quantity: number; priceSnapshot: number; titleSnapshot: string; imageSnapshot: string | null; skuSnapshot: string }[];
    shipping: {
      shippingFullName: string;
      shippingPhone: string;
      shippingEmail: string;
      shippingAddress: string;
      shippingCity: string;
      shippingRegion: string;
      shippingNotes?: string;
    };
    paymentMethod: PaymentMethod;
    subtotal: number;
    shippingCost: number;
    total: number;
    initialStatus: OrderStatus;
    transactionStatus: TransactionStatus;
  }) =>
    prisma.$transaction(async (tx) => {
      // Décrémente le stock et vérifie qu'il reste suffisant — évite la
      // survente en cas de requêtes concurrentes sur le même produit.
      for (const item of params.items) {
        const updateResult = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updateResult.count === 0) {
          throw new Error(`STOCK_INSUFFICIENT:${item.productId}`);
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${crypto.randomUUID().split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`,
          userId: params.userId,
          status: params.initialStatus,
          paymentMethod: params.paymentMethod,
          shippingFullName: params.shipping.shippingFullName,
          shippingPhone: params.shipping.shippingPhone,
          shippingEmail: params.shipping.shippingEmail,
          shippingAddress: params.shipping.shippingAddress,
          shippingCity: params.shipping.shippingCity,
          shippingRegion: params.shipping.shippingRegion,
          shippingNotes: params.shipping.shippingNotes,
          subtotal: params.subtotal,
          shippingCost: params.shippingCost,
          total: params.total,
          items: {
            create: params.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              priceSnapshot: i.priceSnapshot,
              titleSnapshot: i.titleSnapshot,
              imageSnapshot: i.imageSnapshot,
              skuSnapshot: i.skuSnapshot,
            })),
          },
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

      // Snapshot financier immuable à la commande. Aucun transfert n'est
      // déclenché ici : un contrat absent laisse le settlement en revue.
      const owners = await tx.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: { select: { ownerId: true } } },
      });
      const bySeller = new Map<string, number>();
      for (const item of owners) {
        if (item.product.ownerId) bySeller.set(item.product.ownerId, (bySeller.get(item.product.ownerId) ?? 0) + item.quantity * item.priceSnapshot);
      }
      for (const [sellerId, grossAmount] of bySeller) {
        const contract = await tx.sellerContract.findFirst({
          where: {
            sellerId,
            status: "APPROVED",
            AND: [
              { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: order.createdAt } }] },
              { OR: [{ effectiveTo: null }, { effectiveTo: { gt: order.createdAt } }] },
            ],
          },
          orderBy: { version: "desc" },
        });
        const commissionAmount = contract
          ? contract.type === "PERCENTAGE" ? Math.round(grossAmount * contract.value / 100) : Math.min(grossAmount, contract.value)
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
            reviewNote: contract ? null : "Aucun contrat actif au moment de la commande.",
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: params.userId } });

      return order;
    }),

  updateStatus: (id: string, status: OrderStatus) =>
    prisma.order.update({ where: { id }, data: { status }, include: orderDetailInclude }),

  /** Restaure le stock des articles d'une commande annulée. */
  restoreStock: (orderId: string) =>
    prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }),
};
