import { messagesRepository } from "./messages.repository";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import type { UserMessage } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────

interface MessageRow extends UserMessage {
  sender: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  } | null;
}

const toMessageDto = (m: MessageRow) => ({
  id: m.id,
  type: m.type,
  subject: m.subject,
  body: m.body,
  read: m.read,
  readAt: m.readAt,
  createdAt: m.createdAt,
  sender: m.sender
    ? {
        id: m.sender.id,
        fullName: m.sender.fullName,
        avatarUrl: m.sender.avatarUrl,
        role: m.sender.role,
      }
    : null,
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const messagesService = {
  async list(userId: string, page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);
    const [items, totalItems] = await messagesRepository.findManyByRecipient(
      userId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );
    return buildPaginatedResult(
      items.map(toMessageDto),
      totalItems,
      pagination
    );
  },

  async getById(userId: string, messageId: string) {
    const message = await messagesRepository.findById(messageId);
    if (!message) throw new NotFoundError("Message");
    if (message.recipientId !== userId) {
      throw new ForbiddenError("Ce message ne vous appartient pas.");
    }
    return toMessageDto(message);
  },

  async markRead(userId: string, messageId: string) {
    const message = await messagesRepository.findById(messageId);
    if (!message) throw new NotFoundError("Message");
    if (message.recipientId !== userId) {
      throw new ForbiddenError("Ce message ne vous appartient pas.");
    }
    await messagesRepository.markRead(messageId, userId);
  },

  async markAllRead(userId: string) {
    await messagesRepository.markAllRead(userId);
  },

  async countUnread(userId: string) {
    return messagesRepository.countUnread(userId);
  },
};