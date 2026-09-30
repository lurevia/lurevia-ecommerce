import type { FeedbackCategory } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { adminRepository } from "../admin.repository";
import { productsRepository } from "../../products/products.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import type { ListFeedbackQuery, ListReviewsQuery } from "../admin.validators";

export interface RawReviewRow {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: { fullName: string; email: string | null; avatarUrl: string | null };
  product: { title: string };
}

export const toReviewDto = (r: RawReviewRow) => ({
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
});

export const adminModerationService = {
  // ─── Avis ───
  async listReviews(query: ListReviewsQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [reviews, totalItems] = await adminRepository.findManyReviews({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      productId: query.productId,
      search: query.search,
      status: query.status,
      rating: query.rating,
    });
    return buildPaginatedResult(reviews.map(toReviewDto), totalItems, pagination);
  },

  async removeReview(id: string) {
    const review = await adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError("Avis");
    await adminRepository.deleteReview(id);
    await productsRepository.refreshRatingCache(review.productId);
  },

  async approveReview(id: string, adminId: string) {
    const review = await adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError("Avis");
    if (review.rejectedAt) {
      throw new ConflictError("Cet avis a déjà été rejeté.");
    }
    const updated = await prisma.productReview.update({
      where: { id },
      data: {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
      },
      include: {
        user: { select: { fullName: true, email: true, avatarUrl: true } },
        product: { select: { title: true } },
      },
    });
    await productsRepository.refreshRatingCache(review.productId);
    return toReviewDto(updated);
  },

  async rejectReview(id: string, adminId: string, reason?: string) {
    const review = await adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError("Avis");
    const updated = await prisma.productReview.update({
      where: { id },
      data: {
        isApproved: false,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: reason ?? null,
      },
      include: {
        user: { select: { fullName: true, email: true, avatarUrl: true } },
        product: { select: { title: true } },
      },
    });
    await productsRepository.refreshRatingCache(review.productId);
    return toReviewDto(updated);
  },

  // ─── Feedback ───
  async listFeedback(query: ListFeedbackQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [items, totalItems] = await adminRepository.findManyFeedback({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      category: query.category as FeedbackCategory | undefined,
    });

    const mapped = items.map((item) => ({
      id: item.id,
      userId: item.userId,
      userName: item.user.fullName,
      userEmail: item.user.email ?? undefined,
      overallRating: item.overallRating,
      category: item.category,
      comment: item.comment,
      teamResponse: item.teamResponse ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return buildPaginatedResult(mapped, totalItems, pagination);
  },

  async respondToFeedback(id: string, teamResponse: string) {
    const feedback = await adminRepository.findFeedbackById(id);
    if (!feedback) throw new NotFoundError("Feedback");
    return adminRepository.updateFeedbackResponse(id, teamResponse);
  },

  async removeFeedback(id: string) {
    const feedback = await adminRepository.findFeedbackById(id);
    if (!feedback) throw new NotFoundError("Feedback");
    await adminRepository.deleteFeedback(id);
  },
};
