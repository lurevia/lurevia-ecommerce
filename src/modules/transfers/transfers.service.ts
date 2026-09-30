import { transfersRepository } from "./transfers.repository";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import type { TransferLedger } from "@prisma/client";
import type { ListTransfersQuery } from "./transfers.validators";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────

type TransferWithRelations = TransferLedger & {
  settlement: {
    id: string;
    order: { orderNumber: string };
  };
};

const toTransferDto = (t: TransferWithRelations) => ({
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
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const transfersService = {
  async listMine(sellerId: string, query: ListTransfersQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [items, totalItems] = await transfersRepository.findManyBySeller(
      sellerId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit,
      query.status
    );
    return buildPaginatedResult(
      items.map(toTransferDto),
      totalItems,
      pagination
    );
  },

  async getById(sellerId: string, transferId: string) {
    const transfer = await transfersRepository.findById(transferId);
    if (!transfer) throw new NotFoundError("Transfert");
    if (transfer.sellerId !== sellerId) {
      throw new ForbiddenError("Ce transfert ne vous appartient pas.");
    }
    return toTransferDto(transfer);
  },

  async getSummary(sellerId: string) {
    return transfersRepository.aggregateForSeller(sellerId);
  },
};