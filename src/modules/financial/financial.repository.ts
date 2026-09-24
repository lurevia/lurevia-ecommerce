import { prisma } from "../../lib/prisma";

export const financialRepository = {
  contracts: (where: any, skip: number, take: number) => prisma.$transaction([
    prisma.sellerContract.findMany({ where, include: { seller: { select: { id: true, fullName: true, email: true } } }, orderBy: [{ createdAt: "desc" }], skip, take }),
    prisma.sellerContract.count({ where }),
  ]),
  contract: (id: string) => prisma.sellerContract.findUnique({ where: { id }, include: { seller: { select: { id: true, fullName: true, email: true } } } }),
  nextVersion: async (sellerId: string) => {
    const latest = await prisma.sellerContract.findFirst({ where: { sellerId }, orderBy: { version: "desc" }, select: { version: true } });
    return (latest?.version ?? 0) + 1;
  },
  createContract: (data: any) => prisma.sellerContract.create({ data }),
  reviewContract: (id: string, approved: boolean, adminId: string, reason?: string) =>
    prisma.sellerContract.update({ where: { id }, data: { status: approved ? "APPROVED" : "REJECTED", reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: approved ? null : reason } }),
  settlements: (where: any, skip: number, take: number) => prisma.$transaction([
    prisma.sellerSettlement.findMany({ where, include: { seller: { select: { id: true, fullName: true, email: true } }, order: { select: { id: true, orderNumber: true, total: true } }, contract: true, transfers: true }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.sellerSettlement.count({ where }),
  ]),
  transfers: (where: any, skip: number, take: number) => prisma.$transaction([
    prisma.transferLedger.findMany({ where, include: { seller: { select: { id: true, fullName: true, email: true } }, settlement: { include: { order: { select: { orderNumber: true } } } } }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.transferLedger.count({ where }),
  ]),
  createTransfer: (settlementId: string, idempotencyKey: string) => prisma.$transaction(async (tx) => {
    const settlement = await tx.sellerSettlement.findUnique({ where: { id: settlementId } });
    if (!settlement) return null;
    const transfer = await tx.transferLedger.upsert({
      where: { idempotencyKey },
      update: {},
      create: { settlementId, sellerId: settlement.sellerId, amount: settlement.netAmount, idempotencyKey },
    });
    if (settlement.status === "READY") await tx.sellerSettlement.update({ where: { id: settlementId }, data: { status: "TRANSFER_PENDING" } });
    return transfer;
  }),
  stats: async () => {
    const [settlements, transfers, contracts] = await Promise.all([
      prisma.sellerSettlement.aggregate({ _sum: { grossAmount: true, commissionAmount: true, netAmount: true }, _count: true }),
      prisma.transferLedger.aggregate({ _sum: { amount: true }, _count: true, where: { status: "COMPLETED" } }),
      prisma.sellerContract.count({ where: { status: "APPROVED" } }),
    ]);
    return { settlements: settlements._count, grossAmount: settlements._sum.grossAmount ?? 0, commissionAmount: settlements._sum.commissionAmount ?? 0, netAmount: settlements._sum.netAmount ?? 0, completedTransfers: transfers._count, transferredAmount: transfers._sum.amount ?? 0, activeContracts: contracts };
  },
};
