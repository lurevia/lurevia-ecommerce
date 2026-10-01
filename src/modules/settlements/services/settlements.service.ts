import { settlementsRepository, type SettlementsRepository } from "../repository/settlements.repository";
import { ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import type { ListSettlementsQuery } from "../dto";
import { settlementsMapper } from "../mapper/settlements.mapper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class SettlementsService {
    constructor(
        private readonly repository: SettlementsRepository
    ) { }

    async listMine(sellerId: string, query: ListSettlementsQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] = await this.repository.findManyBySeller(
            sellerId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit,
            query.status
        );
        return buildPaginatedResult(
            settlementsMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    async getById(sellerId: string, settlementId: string) {
        const settlement = await this.repository.findById(settlementId);
        if (!settlement) throw new NotFoundError("Règlement");
        if (settlement.sellerId !== sellerId) {
            throw new ForbiddenError("Ce règlement ne vous appartient pas.");
        }
        return settlement;
    }

    async getSummary(sellerId: string) {
        return this.repository.aggregateForSeller(sellerId);
    }
}

export const settlementsService = new SettlementsService(settlementsRepository);
