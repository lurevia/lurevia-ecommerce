import { reviewsRepository } from "./reviews.repository";
import { productsRepository } from "../products/products.repository";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "./reviews.validators";
import { toReviewDto } from "./reviews.dto";
import { reviewsAnalyticsService } from "./reviews-analytics.service";

export { toReviewDto, type ReviewRow } from "./reviews.dto";

export const reviewsService = {
  async listForProduct(productId: string, page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);
    const [items, totalItems] = await reviewsRepository.findByProduct(
      productId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );
    return buildPaginatedResult(
      items.map(toReviewDto),
      totalItems,
      pagination
    );
  },

  async getMyReviewForProduct(productId: string, userId: string) {
    const review = await reviewsRepository.findByProductAndUser(
      productId,
      userId
    );
    return review ? toReviewDto(review) : null;
  },

  getProductRating: reviewsAnalyticsService.getProductRating.bind(reviewsAnalyticsService),
  checkEligibility: reviewsAnalyticsService.checkEligibility.bind(reviewsAnalyticsService),

  async create(productId: string, userId: string, input: CreateReviewInput) {
    const eligibility = await reviewsAnalyticsService.checkEligibility(
      productId,
      userId
    );
    if (!eligibility.canReview) {
      throw new ConflictError(
        "Vous n'êtes pas éligible pour laisser un avis sur ce produit.",
        eligibility
      );
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
    if (review.userId !== userId) {
      throw new ForbiddenError("Cet avis ne vous appartient pas.");
    }

    const wasApproved = review.isApproved;

    const updated = await reviewsRepository.update(reviewId, {
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      ...(wasApproved && {
        isApproved: false,
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
      }),
    });

    await productsRepository.refreshRatingCache(review.productId);
    return toReviewDto(updated);
  },

  async remove(reviewId: string, userId: string) {
    const review = await reviewsRepository.findById(reviewId);
    if (!review) throw new NotFoundError("Avis");
    if (review.userId !== userId) {
      throw new ForbiddenError("Cet avis ne vous appartient pas.");
    }

    await reviewsRepository.delete(reviewId);
    await productsRepository.refreshRatingCache(review.productId);
  },
};
