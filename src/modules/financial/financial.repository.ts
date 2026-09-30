import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

const sellerSelect = {
  select: { id: true, fullName: true, email: true },
} satisfies Prisma.UserDefaultArgs;

export const financialRepository = {
  contracts: (
    where: Prisma.SellerContractWhereInput,
    skip: number,
    take: number
  ) =>
    prisma.$transaction([
      prisma.sellerContract.findMany({
        where,
        include: { seller: sellerSelect },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.sellerContract.count({ where }),
    ]),

  contract: (id: string) =>
    prisma.sellerContract.findUnique({
      where: { id },
      include: { seller: sellerSelect },
    }),

  findPendingContract: (sellerId: string) =>
    prisma.sellerContract.findFirst({
      where: { sellerId, status: "PENDING" },
    }),

  nextVersion: async (sellerId: string): Promise<number> => {
    const latest = await prisma.sellerContract.findFirst({
      where: { sellerId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    return (latest?.version ?? 0) + 1;
  },

  createContract: (data: Prisma.SellerContractCreateInput) =>
    prisma.sellerContract.create({ data }),

  reviewContract: (
    id: string,
    approved: boolean,
    adminId: string,
    reason?: string
  ) =>
    prisma.sellerContract.update({
      where: { id },
      data: {
        status: approved ? "APPROVED" : "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: approved ? null : reason ?? null,
        ...(approved && { effectiveFrom: new Date() }),
      },
    }),

  settlements: (
    where: Prisma.SellerSettlementWhereInput,
    skip: number,
    take: number
  ) =>
    prisma.$transaction([
      prisma.sellerSettlement.findMany({
        where,
        include: {
          seller: sellerSelect,
          order: { select: { id: true, orderNumber: true, total: true } },
          contract: true,
          transfers: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.sellerSettlement.count({ where }),
    ]),

  settlement: (id: string) =>
    prisma.sellerSettlement.findUnique({
      where: { id },
      include: { seller: sellerSelect, order: true },
    }),

  transfers: (
    where: Prisma.TransferLedgerWhereInput,
    skip: number,
    take: number
  ) =>
    prisma.$transaction([
      prisma.transferLedger.findMany({
        where,
        include: {
          seller: sellerSelect,
          settlement: {
            include: { order: { select: { orderNumber: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.transferLedger.count({ where }),
    ]),

  findTransferByIdempotencyKey: (idempotencyKey: string) =>
    prisma.transferLedger.findUnique({ where: { idempotencyKey } }),

  createTransfer: (
    settlementId: string,
    idempotencyKey: string,
    actorUserId: string
  ) =>
    prisma.$transaction(async (tx) => {
      const settlement = await tx.sellerSettlement.findUnique({
        where: { id: settlementId },
      });

      if (!settlement) return { error: "NOT_FOUND" as const };

      if (settlement.status !== "READY" && settlement.status !== "TRANSFER_PENDING") {
        return { error: "INVALID_STATUS" as const, status: settlement.status };
      }

      const existing = await tx.transferLedger.findUnique({
        where: { idempotencyKey },
      });
      if (existing && existing.settlementId !== settlementId) {
        return { error: "IDEMPOTENCY_KEY_CONFLICT" as const };
      }

      const transfer = await tx.transferLedger.upsert({
        where: { idempotencyKey },
        update: {},
        create: {
          settlementId,
          sellerId: settlement.sellerId,
          amount: settlement.netAmount,
          idempotencyKey,
        },
      });

      // Passe le settlement en TRANSFER_PENDING si READY
      if (settlement.status === "READY") {
        await tx.sellerSettlement.update({
          where: { id: settlementId },
          data: { status: "TRANSFER_PENDING" },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "TRANSFER_INITIATED",
          entityType: "TransferLedger",
          entityId: transfer.id,
          metadata: {
            settlementId,
            amount: settlement.netAmount,
            sellerId: settlement.sellerId,
          },
        },
      });

      return { transfer };
    }),
  stats: async () => {
    const [settlements, transfers, contracts] = await Promise.all([
      prisma.sellerSettlement.aggregate({
        _sum: {
          grossAmount: true,
          commissionAmount: true,
          netAmount: true,
        },
        _count: true,
      }),
      prisma.transferLedger.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { status: "COMPLETED" },
      }),
      prisma.sellerContract.count({ where: { status: "APPROVED" } }),
    ]);

    return {
      settlements: settlements._count,
      grossAmount: settlements._sum.grossAmount ?? 0,
      commissionAmount: settlements._sum.commissionAmount ?? 0,
      netAmount: settlements._sum.netAmount ?? 0,
      completedTransfers: transfers._count,
      transferredAmount: transfers._sum.amount ?? 0,
      activeContracts: contracts,
    };
  },
};