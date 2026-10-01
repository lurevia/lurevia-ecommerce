import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { messagesService, type MessagesService } from "../services/messages.service";
import { sendSuccess, sendNoContent } from "../../../utils/apiResponse";
import type { ListMessagesQuery } from "../dto";

export class MessagesController {
    constructor(
        private readonly service: MessagesService
    ) { }

    list = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as ListMessagesQuery;
        const result = await this.service.list(req.user!.id, page, limit);
        sendSuccess(res, result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const message = await this.service.getById(
            req.user!.id,
            req.params.id
        );
        sendSuccess(res, { message });
    });

    markRead = asyncHandler(async (req: Request, res: Response) => {
        await this.service.markRead(req.user!.id, req.params.id);
        sendNoContent(res);
    });

    markAllRead = asyncHandler(async (req: Request, res: Response) => {
        await this.service.markAllRead(req.user!.id);
        sendNoContent(res);
    });

    unreadCount = asyncHandler(async (req: Request, res: Response) => {
        const count = await this.service.countUnread(req.user!.id);
        sendSuccess(res, { count });
    });
}

export const messagesController = new MessagesController(messagesService);
