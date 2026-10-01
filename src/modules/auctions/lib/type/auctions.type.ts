import type { Product, ProductImage, AuctionMessageType } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────
export type AuctionProduct = Product & {
  images: ProductImage[];
  _count: { bids: number; auctionWatchers: number; };
};

export interface MessageWithUser {
  id: string;
  productId: string;
  userId: string | null;
  type: AuctionMessageType;
  content: string;
  metadata: unknown;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  } | null;
}
