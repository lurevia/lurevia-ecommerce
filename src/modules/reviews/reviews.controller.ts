import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { reviewsService } from "./reviews.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";
import type { ListReviewsQuery } from "./reviews.validators";

export const reviewsController = {
  listForProduct: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ListReviewsQuery;
    const result = await reviewsService.listForProduct(
      req.params.productId,
      page,
      limit
    );
    sendSuccess(res, result);
  }),

  getRating: asyncHandler(async (req: Request, res: Response) => {
    const rating = await reviewsService.getProductRating(req.params.productId);
    sendSuccess(res, rating);
  }),

  getMine: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.getMyReviewForProduct(
      req.params.productId,
      req.user!.id
    );
    sendSuccess(res, { review });
  }),

  getEligibility: asyncHandler(async (req: Request, res: Response) => {
    const eligibility = await reviewsService.checkEligibility(
      req.params.productId,
      req.user?.id
    );
    sendSuccess(res, eligibility);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.create(
      req.params.productId,
      req.user!.id,
      req.body
    );
    sendCreated(res, { review });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.update(
      req.params.id,
      req.user!.id,
      req.body
    );
    sendSuccess(res, { review });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await reviewsService.remove(req.params.id, req.user!.id);
    sendNoContent(res);
  }),
};