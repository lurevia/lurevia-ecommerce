export interface ReviewRow {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { fullName: string; avatarUrl: string | null; };
}
