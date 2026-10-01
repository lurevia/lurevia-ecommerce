import type { Prisma, SettlementStatus, TransferStatus } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { financialRepository, type FinancialRepository } from "../repository/financial.repository";
import type { FinancialListQuery } from "../dto";
import { sellerSearchFilter } from "../lib/helper/financial.helper";

export class FinancialSettlementsService {
    constructor(
        private readonly repository: FinancialRepository
    ) { }

    async listSettlements(query: FinancialListQuery) {
        const p = normalizePagination(query.page, query.limit);
        const where: Prisma.SellerSettlementWhereInput = {
            ...(query.status ? { status: query.status as SettlementStatus } : {}),
            ...(query.sellerId ? { sellerId: query.sellerId } : {}),
            ...sellerSearchFilter(query.search),
        };
        const [items, total] = await this.repository.settlements(
            where,
            (p.page - 1) * p.limit,
            p.limit
        );
        return buildPaginatedResult(
            items.map((item) => ({
                id: item.id,
                order: {
                    id: item.order.id,
                    orderNumber: item.order.orderNumber,
                    total: item.order.total,
                },
                seller: item.seller,
                contractVersion: item.contractVersion,
                grossAmount: item.grossAmount,
                commissionAmount: item.commissionAmount,
                netAmount: item.netAmount,
                status: item.status,
                reviewNote: item.reviewNote,
                transfersCount: item.transfers.length,
                createdAt: item.createdAt,
            })),
            total,
            p
        );
    }

    async listCommissions(query: FinancialListQuery) {
        const p = normalizePagination(query.page, query.limit);
        const where: Prisma.SellerSettlementWhereInput = {
            ...(query.sellerId ? { sellerId: query.sellerId } : {}),
            ...sellerSearchFilter(query.search),
        };
        const [items, total] = await this.repository.settlements(
            where,
            (p.page - 1) * p.limit,
            p.limit
        );
        return buildPaginatedResult(
            items.map((item) => ({
                id: item.id,
                seller: item.seller,
                order: {
                    orderNumber: item.order.orderNumber,
                    total: item.order.total,
                },
                grossAmount: item.grossAmount,
                commissionAmount: item.commissionAmount,
                netAmount: item.netAmount,
                contractType: item.contract?.type ?? null,
                contractValue: item.contract?.value ?? null,
                contractVersion: item.contractVersion,
                status: item.status,
                createdAt: item.createdAt,
            })),
            total,
            p
        );
    }

    async listTransfers(query: FinancialListQuery) {
        const p = normalizePagination(query.page, query.limit);
        const where: Prisma.TransferLedgerWhereInput = {
            ...(query.sellerId ? { sellerId: query.sellerId } : {}),
            ...(query.status ? { status: query.status as TransferStatus } : {}),
            ...(query.search
                ? {
                    seller: {
                        OR: [
                            { fullName: { contains: query.search, mode: "insensitive" } },
                            { email: { contains: query.search, mode: "insensitive" } },
                        ],
                    },
                }
                : {}),
        };
        const [items, total] = await this.repository.transfers(
            where,
            (p.page - 1) * p.limit,
            p.limit
        );
        return buildPaginatedResult(
            items.map((item) => ({
                id: item.id,
                seller: item.seller,
                amount: item.amount,
                currency: item.currency,
                status: item.status,
                externalReference: item.externalReference,
                failureReason: item.failureReason,
                settlement: {
                    id: item.settlementId,
                    orderNumber: item.settlement.order.orderNumber,
                },
                createdAt: item.createdAt,
                completedAt: item.completedAt,
            })),
            total,
            p
        );
    }

    async createTransfer(
        settlementId: string,
        idempotencyKey: string,
        actorUserId: string
    ) {
        const result = await this.repository.createTransfer(
            settlementId,
            idempotencyKey,
            actorUserId
        );

        if ("error" in result) {
            switch (result.error) {
                case "NOT_FOUND":
                    throw new NotFoundError("Settlement");
                case "INVALID_STATUS":
                    throw new ConflictError(
                        `Ce settlement ne peut pas être transféré (statut actuel : ${result.status}).`
                    );
                case "IDEMPOTENCY_KEY_CONFLICT":
                    throw new ConflictError(
                        "Cette clé d'idempotence est déjà utilisée pour un autre transfert."
                    );
            }
        }

        return result.transfer;
    }
}

export const financialSettlementsService = new FinancialSettlementsService(financialRepository);
