import { reviewsRepository, type ReviewsRepository } from "../repository/reviews.repository";
import { productsRepository } from "../../products/repository/products.repository";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import type { CreateReviewInput, UpdateReviewInput } from "../dto";
import { reviewsAnalyticsService, type ReviewsAnalyticsService } from "./reviews-analytics.service";
import { reviewsMapper } from "../mapper/reviews.mapper";

export class ReviewsService {
    constructor(
        private readonly reviewsRepository: ReviewsRepository,
        private readonly reviewsAnalyticsService: ReviewsAnalyticsService
    ) { }

    async listForProduct(productId: string, page?: number, limit?: number) {
        const pagination = normalizePagination(page, limit);
        const [items, totalItems] = await this.reviewsRepository.findByProduct(
            productId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );
        return buildPaginatedResult(
            reviewsMapper.toOutputList(items as any),
            totalItems,
            pagination
        );
    }

    async getMyReviewForProduct(productId: string, userId: string) {
        const review = await this.reviewsRepository.findByProductAndUser(
            productId,
            userId
        );
        return review ? reviewsMapper.toOutput(review as any) : null;
    }

    getProductRating(...args: Parameters<ReviewsAnalyticsService["getProductRating"]>) {
        return this.reviewsAnalyticsService.getProductRating(...args);
    }

    checkEligibility(...args: Parameters<ReviewsAnalyticsService["checkEligibility"]>) {
        return this.reviewsAnalyticsService.checkEligibility(...args);
    }

    async create(productId: string, userId: string, input: CreateReviewInput) {
        const eligibility = await this.reviewsAnalyticsService.checkEligibility(
            productId,
            userId
        );
        if (!eligibility.canReview) {
            throw new ConflictError(
                "Vous n'êtes pas éligible pour laisser un avis sur ce produit.",
                eligibility
            );
        }

        const review = await this.reviewsRepository.create({
            product: { connect: { id: productId } },
            user: { connect: { id: userId } },
            rating: input.rating,
            title: input.title,
            comment: input.comment,
            isVerifiedPurchase: true,
        });

        await productsRepository.refreshRatingCache(productId);
        return reviewsMapper.toOutput(review as any);
    }

    async update(reviewId: string, userId: string, input: UpdateReviewInput) {
        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) throw new NotFoundError("Avis");
        if (review.userId !== userId) {
            throw new ForbiddenError("Cet avis ne vous appartient pas.");
        }

        const wasApproved = review.isApproved;

        const updated = await this.reviewsRepository.update(reviewId, {
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

        if (review.productId) {
            await productsRepository.refreshRatingCache(review.productId);
        }
        return reviewsMapper.toOutput(updated as any);
    }

    async remove(reviewId: string, userId: string) {
        const review = await this.reviewsRepository.findById(reviewId);
        if (!review) throw new NotFoundError("Avis");
        if (review.userId !== userId) {
            throw new ForbiddenError("Cet avis ne vous appartient pas.");
        }

        await this.reviewsRepository.delete(reviewId);
        if (review.productId) {
            await productsRepository.refreshRatingCache(review.productId);
        }
    }
}

export const reviewsService = new ReviewsService(reviewsRepository, reviewsAnalyticsService);
