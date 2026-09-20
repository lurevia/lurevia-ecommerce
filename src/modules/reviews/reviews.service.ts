import { reviewsRepository } from "./reviews.repository";
import { productsRepository } from "../products/products.repository";
import { env } from "../../config/env";
import { ConflictError, ForbiddenError, NotFoundError } from "../../errors/AppError";
import type { CreateReviewInput, UpdateReviewInput } from "./reviews.validators";

const DAY_MS = 24 * 60 * 60 * 1000;

const toReviewDto = (review: {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: { fullName: string; avatarUrl: string | null };
}) => ({
  id: review.id,
  productId: review.productId,
  userId: review.userId,
  userName: review.user?.fullName,
  userAvatar: review.user?.avatarUrl ?? undefined,
  rating: review.rating,
  title: review.title ?? undefined,
  comment: review.comment,
  isVerifiedPurchase: review.isVerifiedPurchase,
  createdAt: review.createdAt.toISOString(),
  updatedAt: review.updatedAt.toISOString(),
});

export const reviewsService = {
  async listForProduct(productId: string) {
    const reviews = await reviewsRepository.findByProduct(productId);
    return reviews.map(toReviewDto);
  },

  async getMyReviewForProduct(productId: string, userId: string) {
    const review = await reviewsRepository.findByProductAndUser(productId, userId);
    return review ? toReviewDto(review) : null;
  },

  async getProductRating(productId: string) {
    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Produit");

    const grouped = await reviewsRepository.distributionByProduct(productId);
    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const group of grouped) {
      const rating = group.rating as 1 | 2 | 3 | 4 | 5;
      if (rating >= 1 && rating <= 5) distribution[rating] = group._count.rating;
    }

    return {
      average: Math.round(product.ratingCache * 10) / 10,
      count: product.reviewCountCache,
      distribution,
    };
  },

  async checkEligibility(productId: string, userId: string | undefined) {
    if (!userId) return { canReview: false, reason: "not_logged_in" as const };

    const existing = await reviewsRepository.findByProductAndUser(productId, userId);
    if (existing) return { canReview: false, reason: "already_reviewed" as const };

    const purchase = await reviewsRepository.findEarliestPurchase(userId, productId);
    if (!purchase) return { canReview: false, reason: "not_purchased" as const };

    const availableAt = new Date(purchase.order.createdAt.getTime() + env.REVIEW_DELAY_DAYS * DAY_MS);
    const now = Date.now();

    if (now < availableAt.getTime()) {
      const daysRemaining = Math.ceil((availableAt.getTime() - now) / DAY_MS);
      return {
        canReview: false,
        reason: "waiting" as const,
        availableAt: availableAt.toISOString(),
        daysRemaining,
      };
    }

    return { canReview: true, reason: "eligible" as const };
  },

  async create(productId: string, userId: string, input: CreateReviewInput) {
    const eligibility = await reviewsService.checkEligibility(productId, userId);
    if (!eligibility.canReview) {
      throw new ConflictError("Vous n'êtes pas éligible pour laisser un avis sur ce produit.", eligibility);
    }

    const review = await reviewsRepository.create({
      product: { connect: { id: productId } },
      user: { connect: { id: userId } },
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      isVerifiedPurchase: true,
    });

    await productsRepository.refreshRatingCache(productId);
    return toReviewDto(review);
  },

  async update(reviewId: string, userId: string, input: UpdateReviewInput) {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) throw new NotFoundError("Avis");
    if (review.userId !== userId) throw new ForbiddenError("Cet avis ne vous appartient pas.");

    const updated = await reviewsRepository.update(reviewId, input);
    await productsRepository.refreshRatingCache(review.productId);
    return toReviewDto(updated);
  },

  async remove(reviewId: string, userId: string) {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) throw new NotFoundError("Avis");
    if (review.userId !== userId) throw new ForbiddenError("Cet avis ne vous appartient pas.");

    await reviewsRepository.delete(reviewId);
    await productsRepository.refreshRatingCache(review.productId);
  },
};
