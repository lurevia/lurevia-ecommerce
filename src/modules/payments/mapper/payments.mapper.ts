import { type TransactionWithOrder } from "../lib/type/payments.type";

export class PaymentsMapper {
  toOutput(t: TransactionWithOrder) {
    return {
      id: t.id,
      orderId: t.orderId,
      order: {
        id: t.order.id,
        orderNumber: t.order.orderNumber,
        total: t.order.total,
        currency: t.order.currency,
        status: t.order.status,
      },
      amount: t.amount,
      currency: t.currency,
      method: t.method,
      provider: t.provider,
      status: t.status,
      externalId: t.externalId,
      failureReason: t.failureReason,
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

}

export const paymentsMapper = new PaymentsMapper();
