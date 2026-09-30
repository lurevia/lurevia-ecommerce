import { sellerContractsRepository } from "./seller-contracts.repository";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import type { SellerContract } from "@prisma/client";
import type { ListSellerContractsQuery } from "./seller-contracts.validators";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────

const toContractDto = (c: SellerContract) => ({
  id: c.id,
  version: c.version,
  type: c.type,
  value: c.value,
  currency: c.currency,
  status: c.status,
  effectiveFrom: c.effectiveFrom,
  effectiveTo: c.effectiveTo,
  rejectionReason: c.rejectionReason,
  reviewedAt: c.reviewedAt,
  createdAt: c.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const sellerContractsService = {
  async listMine(sellerId: string, query: ListSellerContractsQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [items, totalItems] =
      await sellerContractsRepository.findManyBySeller(
        sellerId,
        (pagination.page - 1) * pagination.limit,
        pagination.limit,
        query.status
      );
    return buildPaginatedResult(
      items.map(toContractDto),
      totalItems,
      pagination
    );
  },

  async getActive(sellerId: string) {
    const contract = await sellerContractsRepository.findActiveContract(sellerId);
    return contract ? toContractDto(contract) : null;
  },

  async getById(sellerId: string, contractId: string) {
    const contract = await sellerContractsRepository.findById(contractId);
    if (!contract) throw new NotFoundError("Contrat");
    if (contract.sellerId !== sellerId) {
      throw new ForbiddenError("Ce contrat ne vous appartient pas.");
    }
    return toContractDto(contract);
  },
};