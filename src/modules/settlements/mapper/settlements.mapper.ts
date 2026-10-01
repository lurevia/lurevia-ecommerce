import { type SettlementWithRelations } from "../lib/type/settlements.type";

export class SettlementsMapper {
  toOutput(s: SettlementWithRelations) {
    return {
      id: s.id,
      order: {
        id: s.order.id,
        orderNumber: s.order.orderNumber,
        total: s.order.total,
      },
      contract: s.contract
        ? {
          id: s.contract.id,
          version: s.contract.version,
          type: s.contract.type,
          value: s.contract.value,
        }
        : null,
      contractVersion: s.contractVersion,
      grossAmount: s.grossAmount,
      commissionAmount: s.commissionAmount,
      netAmount: s.netAmount,
      status: s.status,
      reviewNote: s.reviewNote,
      transfers: s.transfers,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  toOutputList(items: SettlementWithRelations[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const settlementsMapper = new SettlementsMapper();
