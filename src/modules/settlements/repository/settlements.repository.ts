import { prisma } from "../../../lib/prisma";
import type { SettlementStatus } from "@prisma/client";

export class SettlementsRepository {
    // ─── Liste paginée des settlements du vendeur ───
    findManyBySeller(sellerId: string,
        skip: number,
        take: number,
        status?: SettlementStatus) {
        return prisma.$transaction([
            prisma.sellerSettlement.findMany({
                where: {
                    sellerId,
                    ...(status ? { status } : {}),
                },
                include: {
                    order: {
                        select: { id: true, orderNumber: true, total: true },
                    },
                    contract: {
                        select: { id: true, version: true, type: true, value: true },
                    },
                    transfers: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            createdAt: true,
                            completedAt: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.sellerSettlement.count({
                where: { sellerId, ...(status ? { status } : {}) },
            }),
        ]);
    }

    // ─── Détail ───
    findById(id: string) {
        return prisma.sellerSettlement.findUnique({
            where: { id },
            include: {
                order: true,
                contract: true,
                transfers: true,
            },
        });
    }

    // ─── Résumé financier du vendeur ───
    async aggregateForSeller(sellerId: string) {
        const [all, pending, paid] = await Promise.all([
            prisma.sellerSettlement.aggregate({
                where: { sellerId },
                _sum: {
                    grossAmount: true,
                    commissionAmount: true,
                    netAmount: true,
                },
                _count: true,
            }),
            prisma.sellerSettlement.aggregate({
                where: {
                    sellerId,
                    status: { in: ["PENDING_REVIEW", "READY", "TRANSFER_PENDING"] },
                },
                _sum: { netAmount: true },
                _count: true,
            }),
            prisma.sellerSettlement.aggregate({
                where: { sellerId, status: "PAID" },
                _sum: { netAmount: true },
                _count: true,
            }),
        ]);

        return {
            total: {
                count: all._count,
                grossAmount: all._sum.grossAmount ?? 0,
                commissionAmount: all._sum.commissionAmount ?? 0,
                netAmount: all._sum.netAmount ?? 0,
            },
            pending: {
                count: pending._count,
                netAmount: pending._sum.netAmount ?? 0,
            },
            paid: {
                count: paid._count,
                netAmount: paid._sum.netAmount ?? 0,
            },
        };
    }
}

export const settlementsRepository = new SettlementsRepository();
