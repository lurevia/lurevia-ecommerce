import { type TransferWithRelations } from "../lib/type/transfers.type";

export class TransfersMapper {
  toOutput(t: TransferWithRelations) {
    return {
      id: t.id,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      externalReference: t.externalReference,
      failureReason: t.failureReason,
      settlement: {
        id: t.settlement.id,
        orderNumber: t.settlement.order.orderNumber,
      },
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    };
  }

  toOutputList(items: TransferWithRelations[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const transfersMapper = new TransfersMapper();
