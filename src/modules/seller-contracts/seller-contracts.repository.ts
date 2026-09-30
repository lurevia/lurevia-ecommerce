import { prisma } from "../../lib/prisma";
import type { SellerContractStatus } from "@prisma/client";

export const sellerContractsRepository = {
  // ─── Liste paginée des contrats du vendeur ───
  findManyBySeller: (
    sellerId: string,
    skip: number,
    take: number,
    status?: SellerContractStatus
  ) =>
    prisma.$transaction([
      prisma.sellerContract.findMany({
        where: {
          sellerId,
          ...(status ? { status } : {}),
        },
        orderBy: [{ version: "desc" }],
        skip,
        take,
      }),
      prisma.sellerContract.count({
        where: { sellerId, ...(status ? { status } : {}) },
      }),
    ]),

  // ─── Contrat actif (APPROVED + dates valides) ───
  findActiveContract: (sellerId: string) =>
    prisma.sellerContract.findFirst({
      where: {
        sellerId,
        status: "APPROVED",
        AND: [
          {
            OR: [
              { effectiveFrom: null },
              { effectiveFrom: { lte: new Date() } },
            ],
          },
          {
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gt: new Date() } },
            ],
          },
        ],
      },
      orderBy: { version: "desc" },
    }),

  // ─── Détail ───
  findById: (id: string) =>
    prisma.sellerContract.findUnique({ where: { id } }),
};