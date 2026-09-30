import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { auctionsService } from "./auctions.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";
import type {
  ListAuctionsQuery,
  ListMessagesQuery,
} from "./auctions.validators";

export const auctionsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await auctionsService.list(
      req.query as unknown as ListAuctionsQuery
    );
    sendSuccess(res, result);
  }),

  getByProductId: asyncHandler(async (req: Request, res: Response) => {
    const auction = await auctionsService.getByProductId(req.params.productId);
    sendSuccess(res, { auction });
  }),

  getStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await auctionsService.getStats(req.params.productId);
    sendSuccess(res, stats);
  }),

  // ─── Chat ───
  listMessages: asyncHandler(async (req: Request, res: Response) => {
    const result = await auctionsService.listMessages(
      req.params.productId,
      req.query as unknown as ListMessagesQuery
    );
    sendSuccess(res, result);
  }),

  postMessage: asyncHandler(async (req: Request, res: Response) => {
    const message = await auctionsService.postMessage(
      req.params.productId,
      req.user!.id,
      req.body
    );
    sendCreated(res, { message });
  }),

  deleteMessage: asyncHandler(async (req: Request, res: Response) => {
    await auctionsService.deleteMessage(
      req.params.productId,
      req.params.messageId,
      req.user!.id,
      req.user!.role === "ADMIN"
    );
    sendNoContent(res);
  }),

  watch: asyncHandler(async (req: Request, res: Response) => {
    const result = await auctionsService.watch(
      req.params.productId,
      req.user!.id
    );
    sendSuccess(res, result);
  }),

  unwatch: asyncHandler(async (req: Request, res: Response) => {
    const result = await auctionsService.unwatch(
      req.params.productId,
      req.user!.id
    );
    sendSuccess(res, result);
  }),

  watcherCount: asyncHandler(async (req: Request, res: Response) => {
    const result = await auctionsService.getWatcherCount(req.params.productId);
    sendSuccess(res, result);
  }),
};