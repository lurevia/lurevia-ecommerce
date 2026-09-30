import type { Notification } from "@prisma/client";
import { notificationsRepository } from "./notifications.repository";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import { notificationTriggersService } from "./notifications-triggers.service";

const toNotificationDto = (n: Notification) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  actionUrl: n.actionUrl,
  imageUrl: n.imageUrl,
  read: n.read,
  readAt: n.readAt,
  createdAt: n.createdAt,
});

export const notificationsService = {
  // ─── Liste & lecture ───
  async listAndGenerate(userId: string, page?: number, limit?: number) {
    await notificationTriggersService.generateReviewReminders(userId);

    const pagination = normalizePagination(page, limit);
    const [items, totalItems] = await notificationsRepository.findManyByUser(
      userId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );

    return buildPaginatedResult(
      items.map(toNotificationDto),
      totalItems,
      pagination
    );
  },

  generateReviewReminders: notificationTriggersService.generateReviewReminders.bind(notificationTriggersService),

  // ─── Déclencheurs de notifications ───
  notifyOrderShipped: notificationTriggersService.notifyOrderShipped.bind(notificationTriggersService),
  notifyOrderDelivered: notificationTriggersService.notifyOrderDelivered.bind(notificationTriggersService),
  notifyAccountVerified: notificationTriggersService.notifyAccountVerified.bind(notificationTriggersService),
  notifyIdentityVerified: notificationTriggersService.notifyIdentityVerified.bind(notificationTriggersService),
  notifyPromo: notificationTriggersService.notifyPromo.bind(notificationTriggersService),
  notifyAuctionWon: notificationTriggersService.notifyAuctionWon.bind(notificationTriggersService),
  notifyAuctionOutbid: notificationTriggersService.notifyAuctionOutbid.bind(notificationTriggersService),
  notifyAuctionStarted: notificationTriggersService.notifyAuctionStarted.bind(notificationTriggersService),
  notifyAuctionEndingSoon: notificationTriggersService.notifyAuctionEndingSoon.bind(notificationTriggersService),
  notifyAuctionLost: notificationTriggersService.notifyAuctionLost.bind(notificationTriggersService),

  // ─── Statut de lecture ───
  async markRead(userId: string, id: string) {
    await notificationsRepository.markRead(userId, id);
  },

  async markAllRead(userId: string) {
    await notificationsRepository.markAllRead(userId);
  },

  async clear(userId: string) {
    await notificationsRepository.deleteAllForUser(userId);
  },

  async countUnread(userId: string) {
    return notificationsRepository.countUnread(userId);
  },
};
