import {
  adminNotificationsRepository,
  type CreateAdminNotificationInput,
} from "./adminNotifications.repository";
import { normalizePagination, buildPaginatedResult } from "../../utils/pagination";

const toDto = (n: {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  actorUserId: string | null;
  read: boolean;
  createdAt: Date;
}) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  entityType: n.entityType,
  entityId: n.entityId,
  actorUserId: n.actorUserId ?? undefined,
  read: n.read,
  createdAt: n.createdAt.toISOString(),
});

export const adminNotificationsService = {
  /**
   * Point d'entrée unique appelé depuis les autres modules (commandes,
   * avis, feedback, demandes de suppression) à chaque action cliente qui
   * modifie le serveur. Écriture immédiate en base — pas de recalcul à la
   * lecture, contrairement au système de notifications client.
   */
  notify: (input: CreateAdminNotificationInput) => adminNotificationsRepository.create(input),

  async list(page?: number, limit?: number, unreadOnly?: boolean) {
    const pagination = normalizePagination(page, limit);
    const [items, totalItems] = await adminNotificationsRepository.findMany({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      unreadOnly,
    });
    return buildPaginatedResult(items.map(toDto), totalItems, pagination);
  },

  countUnread: () => adminNotificationsRepository.countUnread(),

  async markRead(id: string) {
    await adminNotificationsRepository.markRead(id);
  },

  async markAllRead() {
    await adminNotificationsRepository.markAllRead();
  },
};
