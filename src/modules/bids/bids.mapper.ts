import { ProductBid } from "@prisma/client";

export interface BidDto {
  id: string;
  productId: string;
  proposedPrice: number;
  comment: string | null;
  status: ProductBid["status"];
  createdAt: Date;
  updatedAt: Date;
  user?: {
    fullName: string;
    email: string;
    phone: string;
  };
  product?: {
    title: string;
    sku: string;
  };
}

export const bidsMapper = {
  toDto: (bid: any): BidDto => ({
    id: bid.id,
    productId: bid.productId,
    proposedPrice: bid.proposedPrice,
    comment: bid.comment,
    status: bid.status,
    createdAt: bid.createdAt,
    updatedAt: bid.updatedAt,
    user: bid.user,
    product: bid.product,
  }),
};
