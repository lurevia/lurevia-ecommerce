import { type ReviewRow } from "../lib/type/reviews.type";

export class ReviewsMapper {
  toOutput(review: ReviewRow) {
    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user?.fullName,
      userAvatar: review.user?.avatarUrl ?? undefined,
      rating: review.rating,
      title: review.title ?? undefined,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase ?? Boolean(review.orderId || review.orderItemId),
      isApproved: review.isApproved,
      approvedAt: review.approvedAt?.toISOString(),
      rejectedAt: review.rejectedAt?.toISOString(),
      rejectionReason: review.rejectionReason ?? undefined,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  toOutputList(items: ReviewRow[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const reviewsMapper = new ReviewsMapper();
