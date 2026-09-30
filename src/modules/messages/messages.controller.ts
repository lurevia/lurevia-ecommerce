import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { messagesService } from "./messages.service";
import { sendSuccess, sendNoContent } from "../../utils/apiResponse";
import type { ListMessagesQuery } from "./messages.validators";

export const messagesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ListMessagesQuery;
    const result = await messagesService.list(req.user!.id, page, limit);
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const message = await messagesService.getById(
      req.user!.id,
      req.params.id
    );
    sendSuccess(res, { message });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await messagesService.markRead(req.user!.id, req.params.id);
    sendNoContent(res);
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await messagesService.markAllRead(req.user!.id);
    sendNoContent(res);
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await messagesService.countUnread(req.user!.id);
    sendSuccess(res, { count });
  }),
};