import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { feedbackService, type FeedbackService } from "../services/feedback.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";
import type { ListFeedbackQuery } from "../dto";

export class FeedbackController {
    constructor(
        private readonly service: FeedbackService
    ) { }

    listPublic = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as ListFeedbackQuery;
        const result = await this.service.listPublic(page, limit);
        sendSuccess(res, result);
    });

    stats = asyncHandler(async (_req: Request, res: Response) => {
        const stats = await this.service.stats();
        sendSuccess(res, stats);
    });

    listMine = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as ListFeedbackQuery;
        const result = await this.service.listMine(req.user!.id, page, limit);
        sendSuccess(res, result);
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const feedback = await this.service.create(req.user!.id, req.body);
        sendCreated(res, { feedback });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const feedback = await this.service.update(
            req.params.id,
            req.user!.id,
            req.body
        );
        sendSuccess(res, { feedback });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        await this.service.remove(req.params.id, req.user!.id);
        sendNoContent(res);
    });
}

export const feedbackController = new FeedbackController(feedbackService);
