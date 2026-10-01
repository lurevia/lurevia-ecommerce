import { type RawReviewRow } from "../lib/type/admin.type";

export class AdminReviewMapper {
  toOutput(r: RawReviewRow) {
    return {
      id: r.id,
      productId: r.productId,
      productTitle: r.product.title,
      userId: r.userId,
      userName: r.user.fullName,
      userEmail: r.user.email ?? undefined,
      userAvatar: r.user.avatarUrl ?? undefined,
      isApproved: r.isApproved,
      approvedAt: r.approvedAt?.toISOString(),
      rejectedAt: r.rejectedAt?.toISOString(),
      rejectionReason: r.rejectionReason ?? undefined,
      rating: r.rating,
      title: r.title ?? undefined,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
      createdAt: r.createdAt.toISOString(),
    };
  }

  toOutputList(items: RawReviewRow[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const adminReviewMapper = new AdminReviewMapper();
