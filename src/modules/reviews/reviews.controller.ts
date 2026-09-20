import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { reviewsService } from "./reviews.service";

export const reviewsController = {
  listForProduct: asyncHandler(async (req: Request, res: Response) => {
    const reviews = await reviewsService.listForProduct(req.params.productId);
    res.status(200).json({ data: { reviews } });
  }),

  getRating: asyncHandler(async (req: Request, res: Response) => {
    const rating = await reviewsService.getProductRating(req.params.productId);
    res.status(200).json({ data: rating });
  }),

  getMine: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.getMyReviewForProduct(req.params.productId, req.user!.id);
    res.status(200).json({ data: { review } });
  }),

  getEligibility: asyncHandler(async (req: Request, res: Response) => {
    const eligibility = await reviewsService.checkEligibility(req.params.productId, req.user?.id);
    res.status(200).json({ data: eligibility });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.create(req.params.productId, req.user!.id, req.body);
    res.status(201).json({ data: { review } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.update(req.params.id, req.user!.id, req.body);
    res.status(200).json({ data: { review } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await reviewsService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  }),
};
