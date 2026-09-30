import { describe, it, expect, vi, beforeEach } from "vitest";
import { reviewsAnalyticsService } from "../src/modules/reviews/reviews-analytics.service";
import { reviewsRepository } from "../src/modules/reviews/reviews.repository";
import { productsRepository } from "../src/modules/products/products.repository";
import { NotFoundError } from "../src/errors/AppError";

describe("Reviews Analytics Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getProductRating", () => {
    it("should throw NotFoundError if product not found", async () => {
      vi.spyOn(productsRepository, "findById").mockResolvedValueOnce(null);

      await expect(
        reviewsAnalyticsService.getProductRating("p-999")
      ).rejects.toThrow(NotFoundError);
    });

    it("should return average, count and rating distribution", async () => {
      vi.spyOn(productsRepository, "findById").mockResolvedValueOnce({
        id: "p1",
        ratingCache: 4.25,
        reviewCountCache: 12,
      } as any);

      vi.spyOn(reviewsRepository, "distributionByProduct").mockResolvedValueOnce([
        { rating: 5, _count: { rating: 6 } },
        { rating: 4, _count: { rating: 4 } },
        { rating: 3, _count: { rating: 2 } },
      ] as any);

      const res = await reviewsAnalyticsService.getProductRating("p1");
      expect(res.average).toBe(4.3);
      expect(res.count).toBe(12);
      expect(res.distribution[5]).toBe(6);
      expect(res.distribution[4]).toBe(4);
      expect(res.distribution[3]).toBe(2);
      expect(res.distribution[1]).toBe(0);
    });
  });

  describe("checkEligibility", () => {
    it("returns not_logged_in if userId is undefined", async () => {
      const res = await reviewsAnalyticsService.checkEligibility("p1", undefined);
      expect(res.canReview).toBe(false);
      expect(res.reason).toBe("not_logged_in");
    });

    it("returns already_reviewed if review already exists", async () => {
      vi.spyOn(reviewsRepository, "findByProductAndUser").mockResolvedValueOnce({
        id: "rev-1",
      } as any);

      const res = await reviewsAnalyticsService.checkEligibility("p1", "u1");
      expect(res.canReview).toBe(false);
      expect(res.reason).toBe("already_reviewed");
    });

    it("returns not_purchased if no delivered purchase found", async () => {
      vi.spyOn(reviewsRepository, "findByProductAndUser").mockResolvedValueOnce(null);
      vi.spyOn(reviewsRepository, "findEarliestPurchase").mockResolvedValueOnce(null);

      const res = await reviewsAnalyticsService.checkEligibility("p1", "u1");
      expect(res.canReview).toBe(false);
      expect(res.reason).toBe("not_purchased");
    });

    it("returns waiting if delay has not elapsed yet", async () => {
      vi.spyOn(reviewsRepository, "findByProductAndUser").mockResolvedValueOnce(null);
      vi.spyOn(reviewsRepository, "findEarliestPurchase").mockResolvedValueOnce({
        order: { createdAt: new Date() }, // Just now, review delay is 5 days
      } as any);

      const res = await reviewsAnalyticsService.checkEligibility("p1", "u1");
      expect(res.canReview).toBe(false);
      expect(res.reason).toBe("waiting");
    });

    it("returns eligible if order was placed long ago", async () => {
      vi.spyOn(reviewsRepository, "findByProductAndUser").mockResolvedValueOnce(null);
      const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      vi.spyOn(reviewsRepository, "findEarliestPurchase").mockResolvedValueOnce({
        order: { createdAt: sixDaysAgo },
      } as any);

      const res = await reviewsAnalyticsService.checkEligibility("p1", "u1");
      expect(res.canReview).toBe(true);
      expect(res.reason).toBe("eligible");
    });
  });
});
