import type { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { financialRepository, type FinancialRepository } from "../repository/financial.repository";
import type { ContractListQuery, CreateContractInput, ReviewContractInput } from "../dto";
import { sellerSearchFilter } from "../lib/helper/financial.helper";

export class FinancialContractsService {
    constructor(
        private readonly repository: FinancialRepository
    ) { }

    async listContracts(query: ContractListQuery) {
        const p = normalizePagination(query.page, query.limit);
        const where: Prisma.SellerContractWhereInput = {
            ...(query.status ? { status: query.status } : {}),
            ...(query.sellerId ? { sellerId: query.sellerId } : {}),
            ...sellerSearchFilter(query.search),
        };
        const [items, total] = await this.repository.contracts(
            where,
            (p.page - 1) * p.limit,
            p.limit
        );
        return buildPaginatedResult(
            items.map((item) => ({
                id: item.id,
                version: item.version,
                type: item.type,
                value: item.value,
                currency: item.currency,
                status: item.status,
                effectiveFrom: item.effectiveFrom,
                effectiveTo: item.effectiveTo,
                rejectionReason: item.rejectionReason,
                reviewedAt: item.reviewedAt,
                createdAt: item.createdAt,
                seller: item.seller,
            })),
            total,
            p
        );
    }

    async createContract(sellerId: string, input: CreateContractInput) {
        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: { id: true, role: true, isActive: true },
        });
        if (!seller) throw new NotFoundError("Vendeur");
        if (seller.role !== "SELLER") {
            throw new ConflictError("Cet utilisateur n'est pas un vendeur.");
        }
        if (!seller.isActive) {
            throw new ConflictError("Ce vendeur est désactivé.");
        }

        const pending = await this.repository.findPendingContract(sellerId);
        if (pending) {
            throw new ConflictError(
                "Un contrat en attente existe déjà pour ce vendeur."
            );
        }

        const version = await this.repository.nextVersion(sellerId);

        return this.repository.createContract({
            type: input.type,
            value: input.value,
            currency: "MGA",
            effectiveFrom: input.effectiveFrom,
            effectiveTo: input.effectiveTo,
            seller: { connect: { id: sellerId } },
            version,
        });
    }

    async reviewContract(
        id: string,
        input: ReviewContractInput,
        adminId: string
    ) {
        const contract = await this.repository.contract(id);
        if (!contract) throw new NotFoundError("Contrat");
        if (contract.status !== "PENDING") {
            throw new ConflictError("Ce contrat a déjà été traité.");
        }

        return this.repository.reviewContract(
            id,
            input.approved,
            adminId,
            input.reason
        );
    }
}

export const financialContractsService = new FinancialContractsService(financialRepository);
