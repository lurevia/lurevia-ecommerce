import { sellerContractsRepository, type SellerContractsRepository } from "../repository/seller-contracts.repository";
import { ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import type { ListSellerContractsQuery } from "../dto";
import { sellerContractsMapper } from "../mapper/seller-contracts.mapper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class SellerContractsService {
    constructor(
        private readonly repository: SellerContractsRepository
    ) { }

    async listMine(sellerId: string, query: ListSellerContractsQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] =
            await this.repository.findManyBySeller(
                sellerId,
                (pagination.page - 1) * pagination.limit,
                pagination.limit,
                query.status
            );
        return buildPaginatedResult(
            sellerContractsMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    async getActive(sellerId: string) {
        const contract = await this.repository.findActiveContract(sellerId);
        return contract ? sellerContractsMapper.toOutput(contract) : null;
    }

    async getById(sellerId: string, contractId: string) {
        const contract = await this.repository.findById(contractId);
        if (!contract) throw new NotFoundError("Contrat");
        if (contract.sellerId !== sellerId) {
            throw new ForbiddenError("Ce contrat ne vous appartient pas.");
        }
        return sellerContractsMapper.toOutput(contract);
    }
}

export const sellerContractsService = new SellerContractsService(sellerContractsRepository);
