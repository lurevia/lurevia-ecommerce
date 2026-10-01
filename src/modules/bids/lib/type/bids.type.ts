import type { ProductBid } from "@prisma/client";

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

// ─────────────────────────────────────────────────────────────────────────────
// Type d'entrée : résultat Prisma typé (pas de `any`)
// ─────────────────────────────────────────────────────────────────────────────
export type BidWithRelations = ProductBid & {
  user: BidUserInfo;
  product?: BidProductInfo;
};
