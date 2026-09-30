import { settlementsRepository } from "./settlements.repository";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import type {
  SellerSettlement,
  Order,
  SellerContract,
  TransferLedger,
} from "@prisma/client";
import type { ListSettlementsQuery } from "./settlements.validators";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────

type SettlementWithRelations = SellerSettlement & {
  order: Pick<Order, "id" | "orderNumber" | "total">;
  contract: Pick<SellerContract, "id" | "version" | "type" | "value"> | null;
  transfers: Array<
    Pick<TransferLedger, "id" | "amount" | "status" | "createdAt" | "completedAt">
  >;
};

const toSettlementDto = (s: SettlementWithRelations) => ({
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
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const settlementsService = {
  async listMine(sellerId: string, query: ListSettlementsQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [items, totalItems] = await settlementsRepository.findManyBySeller(
      sellerId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit,
      query.status
    );
    return buildPaginatedResult(
      items.map(toSettlementDto),
      totalItems,
      pagination
    );
  },

  async getById(sellerId: string, settlementId: string) {
    const settlement = await settlementsRepository.findById(settlementId);
    if (!settlement) throw new NotFoundError("Règlement");
    if (settlement.sellerId !== sellerId) {
      throw new ForbiddenError("Ce règlement ne vous appartient pas.");
    }
    return settlement;
  },

  async getSummary(sellerId: string) {
    return settlementsRepository.aggregateForSeller(sellerId);
  },
};