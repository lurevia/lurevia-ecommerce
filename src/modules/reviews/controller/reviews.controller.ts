import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { reviewsService, type ReviewsService } from "../services/reviews.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";
import type { ListReviewsQuery } from "../dto";

export class ReviewsController {
    constructor(
        private readonly service: ReviewsService
    ) { }

    listForProduct = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as ListReviewsQuery;
        const result = await this.service.listForProduct(
            req.params.productId,
            page,
            limit
        );
        sendSuccess(res, result);
    });

    getRating = asyncHandler(async (req: Request, res: Response) => {
        const rating = await this.service.getProductRating(req.params.productId);
        sendSuccess(res, rating);
    });

    getMine = asyncHandler(async (req: Request, res: Response) => {
        const review = await this.service.getMyReviewForProduct(
            req.params.productId,
            req.user!.id
        );
        sendSuccess(res, { review });
    });

    getEligibility = asyncHandler(async (req: Request, res: Response) => {
        const eligibility = await this.service.checkEligibility(
            req.params.productId,
            req.user?.id
        );
        sendSuccess(res, eligibility);
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const review = await this.service.create(
            req.params.productId,
            req.user!.id,
            req.body
        );
        sendCreated(res, { review });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const review = await this.service.update(
            req.params.id,
            req.user!.id,
            req.body
        );
        sendSuccess(res, { review });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        await this.service.remove(req.params.id, req.user!.id);
        sendNoContent(res);
    });
}

export const reviewsController = new ReviewsController(reviewsService);
