import { messagesRepository, type MessagesRepository } from "../repository/messages.repository";
import { ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { messagesMapper } from "../mapper/messages.mapper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class MessagesService {
    constructor(
        private readonly repository: MessagesRepository
    ) { }

    async list(userId: string, page?: number, limit?: number) {
        const pagination = normalizePagination(page, limit);
        const [items, totalItems] = await this.repository.findManyByRecipient(
            userId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );
        return buildPaginatedResult(
            messagesMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    async getById(userId: string, messageId: string) {
        const message = await this.repository.findById(messageId);
        if (!message) throw new NotFoundError("Message");
        if (message.recipientId !== userId) {
            throw new ForbiddenError("Ce message ne vous appartient pas.");
        }
        return messagesMapper.toOutput(message);
    }

    async markRead(userId: string, messageId: string) {
        const message = await this.repository.findById(messageId);
        if (!message) throw new NotFoundError("Message");
        if (message.recipientId !== userId) {
            throw new ForbiddenError("Ce message ne vous appartient pas.");
        }
        await this.repository.markRead(messageId, userId);
    }

    async markAllRead(userId: string) {
        await this.repository.markAllRead(userId);
    }

    async countUnread(userId: string) {
        return this.repository.countUnread(userId);
    }
}

export const messagesService = new MessagesService(messagesRepository);
