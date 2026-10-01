import { transfersRepository, type TransfersRepository } from "../repository/transfers.repository";
import { ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import type { ListTransfersQuery } from "../dto";
import { transfersMapper } from "../mapper/transfers.mapper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class TransfersService {
    constructor(
        private readonly repository: TransfersRepository
    ) { }

    async listMine(sellerId: string, query: ListTransfersQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] = await this.repository.findManyBySeller(
            sellerId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit,
            query.status
        );
        return buildPaginatedResult(
            transfersMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    async getById(sellerId: string, transferId: string) {
        const transfer = await this.repository.findById(transferId);
        if (!transfer) throw new NotFoundError("Transfert");
        if (transfer.sellerId !== sellerId) {
            throw new ForbiddenError("Ce transfert ne vous appartient pas.");
        }
        return transfersMapper.toOutput(transfer);
    }

    async getSummary(sellerId: string) {
        return this.repository.aggregateForSeller(sellerId);
    }
}

export const transfersService = new TransfersService(transfersRepository);
