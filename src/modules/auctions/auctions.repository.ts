import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// INCLUDE PARTAGÉ
// ─────────────────────────────────────────────────────────────────────────────

const messageUserSelect = {
  select: { id: true, fullName: true, avatarUrl: true, role: true },
} satisfies Prisma.UserDefaultArgs;

// ─────────────────────────────────────────────────────────────────────────────
// REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export const auctionsRepository = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ENCHÈRES (liste publique)
  // ═══════════════════════════════════════════════════════════════════════════

  findMany: (
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput,
    skip: number,
    take: number
  ) =>
    prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          _count: { select: { bids: true } },
        },
      }),
      prisma.product.count({ where }),
    ]),

  findByProductId: (productId: string) =>
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { position: "asc" } },
        owner: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: { select: { bids: true, auctionWatchers: true } },
      },
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT (messages)
  // ═══════════════════════════════════════════════════════════════════════════

  findMessages: (productId: string, skip: number, take: number) =>
    prisma.$transaction([
      prisma.auctionMessage.findMany({
        where: { productId, isDeleted: false },
        include: { user: messageUserSelect },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auctionMessage.count({
        where: { productId, isDeleted: false },
      }),
    ]),

  findMessageById: (id: string) =>
    prisma.auctionMessage.findUnique({ where: { id } }),

  createMessage: (data: Prisma.AuctionMessageCreateInput) =>
    prisma.auctionMessage.create({
      data,
      include: { user: messageUserSelect },
    }),

  softDeleteMessage: (id: string, deletedBy: string) =>
    prisma.auctionMessage.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy,
        deletedAt: new Date(),
      },
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // WATCHERS
  // ═══════════════════════════════════════════════════════════════════════════

  upsertWatcher: (productId: string, userId: string) =>
    prisma.auctionWatcher.upsert({
      where: { productId_userId: { productId, userId } },
      update: { lastSeenAt: new Date(), isActive: true },
      create: { productId, userId },
    }),

  deactivateWatcher: (productId: string, userId: string) =>
    prisma.auctionWatcher.updateMany({
      where: { productId, userId },
      data: { isActive: false },
    }),

  countActiveWatchers: (productId: string) =>
    prisma.auctionWatcher.count({
      where: { productId, isActive: true },
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // CLÔTURE (cron)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Enchères expirées qui doivent être clôturées. */
  findExpiredAuctions: () =>
    prisma.product.findMany({
      where: {
        pricingMode: "AUCTION",
        auctionStatus: "ACTIVE",
        auctionEndAt: { lt: new Date() },
      },
      include: {
        bids: {
          where: { isWinningBid: true },
          include: { user: true },
          take: 1,
        },
      },
    }),

  /** Met à jour une enchère après clôture. */
  closeAuction: (
    productId: string,
    data: {
      status: "SOLD" | "UNSOLD";
      winnerId?: string | null;
      finalPrice?: number | null;
    }
  ) =>
    prisma.product.update({
      where: { id: productId },
      data: {
        auctionStatus: data.status,
        auctionWinnerId: data.winnerId ?? null,
        auctionFinalPrice: data.finalPrice ?? null,
      },
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS LIVE
  // ═══════════════════════════════════════════════════════════════════════════

  getAuctionStats: (productId: string) =>
    prisma.$transaction([
      prisma.productBid.count({ where: { productId } }),
      prisma.auctionWatcher.count({
        where: { productId, isActive: true },
      }),
      prisma.auctionMessage.count({
        where: { productId, isDeleted: false },
      }),
    ]),
};