import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { notificationsService } from "./notifications.service";
import { sendSuccess, sendNoContent } from "../../utils/apiResponse";
import type { ListNotificationsQuery } from "./notifications.validators";

export const notificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ListNotificationsQuery;
    const result = await notificationsService.listAndGenerate(
      req.user!.id,
      page,
      limit
    );
    sendSuccess(res, result);
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationsService.countUnread(req.user!.id);
    sendSuccess(res, { count });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markRead(req.user!.id, req.params.id);
    sendNoContent(res);
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markAllRead(req.user!.id);
    sendNoContent(res);
  }),

  clear: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.clear(req.user!.id);
    sendNoContent(res);
  }),
};