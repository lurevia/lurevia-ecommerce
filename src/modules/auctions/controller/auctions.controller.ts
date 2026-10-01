import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { auctionsService, type AuctionsService } from "../services/auctions.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";
import type { ListAuctionsQuery, ListMessagesQuery } from "../dto";

export class AuctionsController {
    constructor(
        private readonly service: AuctionsService
    ) { }

    list = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.list(
            req.query as unknown as ListAuctionsQuery
        );
        sendSuccess(res, result);
    });

    getByProductId = asyncHandler(async (req: Request, res: Response) => {
        const auction = await this.service.getByProductId(req.params.productId);
        sendSuccess(res, { auction });
    });

    getStats = asyncHandler(async (req: Request, res: Response) => {
        const stats = await this.service.getStats(req.params.productId);
        sendSuccess(res, stats);
    });

    // ─── Chat ───
    listMessages = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listMessages(
            req.params.productId,
            req.query as unknown as ListMessagesQuery
        );
        sendSuccess(res, result);
    });

    postMessage = asyncHandler(async (req: Request, res: Response) => {
        const message = await this.service.postMessage(
            req.params.productId,
            req.user!.id,
            req.body
        );
        sendCreated(res, { message });
    });

    deleteMessage = asyncHandler(async (req: Request, res: Response) => {
        await this.service.deleteMessage(
            req.params.productId,
            req.params.messageId,
            req.user!.id,
            req.user!.role === "ADMIN"
        );
        sendNoContent(res);
    });

    watch = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.watch(
            req.params.productId,
            req.user!.id
        );
        sendSuccess(res, result);
    });

    unwatch = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.unwatch(
            req.params.productId,
            req.user!.id
        );
        sendSuccess(res, result);
    });

    watcherCount = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.getWatcherCount(req.params.productId);
        sendSuccess(res, result);
    });
}

export const auctionsController = new AuctionsController(auctionsService);
