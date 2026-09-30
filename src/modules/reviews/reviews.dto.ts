export const DAY_MS = 24 * 60 * 60 * 1000;

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
  user?: { fullName: string; avatarUrl: string | null };
}

export const toReviewDto = (review: ReviewRow) => ({
  id: review.id,
  productId: review.productId,
  userId: review.userId,
  userName: review.user?.fullName,
  userAvatar: review.user?.avatarUrl ?? undefined,
  rating: review.rating,
  title: review.title ?? undefined,
  comment: review.comment,
  isVerifiedPurchase: review.isVerifiedPurchase,
  isApproved: review.isApproved,
  approvedAt: review.approvedAt?.toISOString(),
  rejectedAt: review.rejectedAt?.toISOString(),
  rejectionReason: review.rejectionReason ?? undefined,
  createdAt: review.createdAt.toISOString(),
  updatedAt: review.updatedAt.toISOString(),
});
