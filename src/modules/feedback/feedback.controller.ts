import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { feedbackService } from "./feedback.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";
import type { ListFeedbackQuery } from "./feedback.validators";

export const feedbackController = {
  listPublic: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ListFeedbackQuery;
    const result = await feedbackService.listPublic(page, limit);
    sendSuccess(res, result);
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await feedbackService.stats();
    sendSuccess(res, stats);
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ListFeedbackQuery;
    const result = await feedbackService.listMine(req.user!.id, page, limit);
    sendSuccess(res, result);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const feedback = await feedbackService.create(req.user!.id, req.body);
    sendCreated(res, { feedback });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const feedback = await feedbackService.update(
      req.params.id,
      req.user!.id,
      req.body
    );
    sendSuccess(res, { feedback });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await feedbackService.remove(req.params.id, req.user!.id);
    sendNoContent(res);
  }),
};