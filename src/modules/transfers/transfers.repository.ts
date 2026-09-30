import { prisma } from "../../lib/prisma";
import type { TransferStatus } from "@prisma/client";

export const transfersRepository = {
  // ─── Liste paginée des transferts du vendeur ───
  findManyBySeller: (
    sellerId: string,
    skip: number,
    take: number,
    status?: TransferStatus
  ) =>
    prisma.$transaction([
      prisma.transferLedger.findMany({
        where: {
          sellerId,
          ...(status ? { status } : {}),
        },
        include: {
          settlement: {
            select: {
              id: true,
              order: { select: { orderNumber: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.transferLedger.count({
        where: { sellerId, ...(status ? { status } : {}) },
      }),
    ]),

  // ─── Détail ───
  findById: (id: string) =>
    prisma.transferLedger.findUnique({
      where: { id },
      include: {
        settlement: {
          include: {
            order: { select: { id: true, orderNumber: true } },
          },
        },
      },
    }),

  // ─── Résumé ───
  aggregateForSeller: async (sellerId: string) => {
    const [pending, completed, failed] = await Promise.all([
      prisma.transferLedger.aggregate({
        where: {
          sellerId,
          status: { in: ["PENDING", "PROCESSING"] },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transferLedger.aggregate({
        where: { sellerId, status: "COMPLETED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transferLedger.aggregate({
        where: { sellerId, status: "FAILED" },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      pending: {
        count: pending._count,
        amount: pending._sum.amount ?? 0,
      },
      completed: {
        count: completed._count,
        amount: completed._sum.amount ?? 0,
      },
      failed: {
        count: failed._count,
        amount: failed._sum.amount ?? 0,
      },
    };
  },
};