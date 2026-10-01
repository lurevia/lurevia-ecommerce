import { type OrderWithRelations } from "../lib/type/orders.type";
import { ORDER_STATUS_TO_API, PAYMENT_METHOD_TO_API, DELIVERY_MODE_TO_API, TRANSACTION_STATUS_TO_API } from "../lib/constant/orders.constant";

export class OrdersMapper {
  // ─────────────────────────────────────────────────────────────────────────────
  // MAPPER
  // ─────────────────────────────────────────────────────────────────────────────
  toOutput(order: OrderWithRelations) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: ORDER_STATUS_TO_API[order.status],
      paymentMethod: PAYMENT_METHOD_TO_API[order.paymentMethod],
      currency: order.currency,

      // ─── Livraison ───
      deliveryMode: DELIVERY_MODE_TO_API[order.deliveryMode],

      shipping: {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        email: order.shippingEmail,
        province: order.shippingProvince,
        region: order.shippingRegion,
        city: order.shippingCity,
        neighborhood: order.shippingNeighborhood ?? undefined,
        address: order.shippingAddress,
        notes: order.shippingNotes ?? undefined,
      },

      // GPS (livraison à domicile)
      deliveryGps:
        order.deliveryLatitude !== null && order.deliveryLongitude !== null
          ? {
            latitude: order.deliveryLatitude,
            longitude: order.deliveryLongitude,
            accuracy: order.deliveryAccuracy ?? undefined,
            sharedAt: order.deliveryGpsSharedAt?.toISOString(),
          }
          : undefined,

      // Point relais (si PICKUP_POINT)
      pickupPoint: order.shippingPickupPoint
        ? {
          id: order.shippingPickupPoint.id,
          name: order.shippingPickupPoint.name,
          provider: order.shippingPickupPoint.provider,
          city: order.shippingPickupPoint.city,
        }
        : undefined,

      // ─── Lignes ───
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        title: item.titleSnapshot,
        imageUrl: item.imageSnapshot ?? undefined,
        sku: item.skuSnapshot,
        price: item.priceSnapshot,
        quantity: item.quantity,
        color: item.colorSnapshot ?? undefined,
        size: item.sizeSnapshot ?? undefined,
      })),

      // ─── Transactions ───
      transactions: order.transactions.map((t) => ({
        id: t.id,
        orderId: t.orderId,
        amount: t.amount,
        method: PAYMENT_METHOD_TO_API[t.method],
        provider: t.provider ?? undefined,
        status: TRANSACTION_STATUS_TO_API[t.status],
        externalId: t.externalId ?? undefined,
        completedAt: t.completedAt?.toISOString(),
        createdAt: t.createdAt.toISOString(),
      })),

      // ─── Financier ───
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,

      // COD (paiement à la livraison)
      cod: order.codAmountExpected
        ? {
          expected: order.codAmountExpected,
          collectedAt: order.codCollectedAt?.toISOString(),
          collectedBy: order.codCollectedBy ?? undefined,
        }
        : undefined,

      // ─── Dates ───
      paidAt: order.paidAt?.toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      cancelledAt: order.cancelledAt?.toISOString(),
      refundedAt: order.refundedAt?.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  toOutputList(items: OrderWithRelations[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const ordersMapper = new OrdersMapper();
