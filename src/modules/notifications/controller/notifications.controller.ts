import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { notificationsService, type NotificationsService } from "../services/notifications.service";
import { sendSuccess, sendNoContent } from "../../../utils/apiResponse";
import type { ListNotificationsQuery } from "../dto";

export class NotificationsController {
    constructor(
        private readonly service: NotificationsService
    ) { }

    list = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as ListNotificationsQuery;
        const result = await this.service.listAndGenerate(
            req.user!.id,
            page,
            limit
        );
        sendSuccess(res, result);
    });

    unreadCount = asyncHandler(async (req: Request, res: Response) => {
        const count = await this.service.countUnread(req.user!.id);
        sendSuccess(res, { count });
    });

    markRead = asyncHandler(async (req: Request, res: Response) => {
        await this.service.markRead(req.user!.id, req.params.id);
        sendNoContent(res);
    });

    markAllRead = asyncHandler(async (req: Request, res: Response) => {
        await this.service.markAllRead(req.user!.id);
        sendNoContent(res);
    });

    clear = asyncHandler(async (req: Request, res: Response) => {
        await this.service.clear(req.user!.id);
        sendNoContent(res);
    });
}

export const notificationsController = new NotificationsController(notificationsService);
