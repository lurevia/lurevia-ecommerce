export interface ReviewRow {
  id: string;
  productId: string | null;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase?: boolean;
  orderId?: string | null;
  orderItemId?: string | null;
  isApproved: boolean;
  approvedAt: Date | null;
  rejectedAt?: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { fullName: string; avatarUrl: string | null; };
}
