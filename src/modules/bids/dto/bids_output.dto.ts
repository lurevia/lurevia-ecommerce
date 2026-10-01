import type { BidStatus } from "@prisma/client";
import { type BidUserInfo, type BidProductInfo } from "../lib/type/bids.type";

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
