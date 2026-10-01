import { reviewsRepository, type ReviewsRepository } from "../repository/reviews.repository";
import { productsRepository } from "../../products/repository/products.repository";
import { NotFoundError } from "../../../errors/AppError";
import { env } from "../../../config/env";
import { DAY_MS } from "../lib/constant/reviews.constant";

export class ReviewsAnalyticsService {
    constructor(
        private readonly repository: ReviewsRepository
    ) { }

    async getProductRating(productId: string) {
        const product = await productsRepository.findById(productId);
        if (!product) throw new NotFoundError("Produit");

        const grouped = await this.repository.distributionByProduct(productId);
        const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };
        for (const group of grouped) {
            const rating = group.rating as 1 | 2 | 3 | 4 | 5;
            if (rating >= 1 && rating <= 5) {
                distribution[rating] = group._count.rating;
            }
        }

        return {
            average: Math.round(product.ratingCache * 10) / 10,
            count: product.reviewCountCache,
            distribution,
        };
    }

    async checkEligibility(productId: string, userId: string | undefined) {
        if (!userId) {
            return { canReview: false, reason: "not_logged_in" as const };
        }

        const existing = await this.repository.findByProductAndUser(
            productId,
            userId
        );
        if (existing) {
            return { canReview: false, reason: "already_reviewed" as const };
        }

        const purchase = await this.repository.findEarliestPurchase(
            userId,
            productId
        );
        if (!purchase) {
            return { canReview: false, reason: "not_purchased" as const };
        }

        const availableAt = new Date(
            purchase.order.createdAt.getTime() + env.REVIEW_DELAY_DAYS * DAY_MS
        );
        const now = Date.now();

        if (now < availableAt.getTime()) {
            const daysRemaining = Math.ceil(
                (availableAt.getTime() - now) / DAY_MS
            );
            return {
                canReview: false,
                reason: "waiting" as const,
                availableAt: availableAt.toISOString(),
                daysRemaining,
            };
        }

        return { canReview: true, reason: "eligible" as const };
    }
}

export const reviewsAnalyticsService = new ReviewsAnalyticsService(reviewsRepository);
