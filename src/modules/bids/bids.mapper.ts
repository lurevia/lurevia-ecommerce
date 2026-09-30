import type { ProductBid, BidStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Types du DTO de sortie
// ─────────────────────────────────────────────────────────────────────────────

export interface BidUserInfo {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface BidProductInfo {
  id: string;
  title: string;
  sku: string;
}

export interface BidDto {
  id: string;
  productId: string;
  proposedPrice: number;
  comment: string | null;
  status: BidStatus;
  isAutoBid: boolean;
  autoBidMax: number | null;
  isWinningBid: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: BidUserInfo;
  product?: BidProductInfo;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type d'entrée : résultat Prisma typé (pas de `any`)
// ─────────────────────────────────────────────────────────────────────────────

export type BidWithRelations = ProductBid & {
  user: BidUserInfo;
  product?: BidProductInfo;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────────────────────

export const bidsMapper = {
  toDto(bid: BidWithRelations): BidDto {
    return {
      id: bid.id,
      productId: bid.productId,
      proposedPrice: bid.proposedPrice,
      comment: bid.comment,
      status: bid.status,
      isAutoBid: bid.isAutoBid,
      autoBidMax: bid.autoBidMax,
      isWinningBid: bid.isWinningBid,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      user: {
        id: bid.user.id,
        fullName: bid.user.fullName,
        avatarUrl: bid.user.avatarUrl,
      },
      product: bid.product,
    };
  },
};