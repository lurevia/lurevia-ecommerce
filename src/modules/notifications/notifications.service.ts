import type { Order } from "@prisma/client";
import { notificationsRepository } from "./notifications.repository";
import { env } from "../../config/env";

const DAY_MS = 24 * 60 * 60 * 1000;

const toNotificationDto = (n: {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string;
  imageUrl: string | null;
  read: boolean;
  createdAt: Date;
}) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  actionUrl: n.actionUrl,
  imageUrl: n.imageUrl ?? undefined,
  read: n.read,
  createdAt: n.createdAt.toISOString(),
});

export const notificationsService = {
  /**
   * Génère les rappels "avis en attente" pour les commandes livrées dont le
   * délai est passé et qui n'ont pas encore été notées, puis renvoie
   * l'ensemble des notifications de l'utilisateur.
   *
   * Génération à la lecture plutôt que par tâche planifiée : le volume par
   * utilisateur reste faible (quelques commandes), donc le coût est
   * négligeable. Une vraie tâche cron serait préférable à grande échelle.
   */
  async listAndGenerate(userId: string) {
    const [deliveredOrders, reviewed] = await Promise.all([
      notificationsRepository.findDeliveredOrdersForUser(userId),
      notificationsRepository.findReviewedProductIds(userId),
    ]);
    const reviewedProductIds = new Set(reviewed.map((r) => r.productId));
    const now = Date.now();

    for (const order of deliveredOrders) {
      const availableAt = order.createdAt.getTime() + env.REVIEW_DELAY_DAYS * DAY_MS;
      if (now < availableAt) continue;

      for (const item of order.items) {
        if (reviewedProductIds.has(item.productId)) continue;

        await notificationsRepository.upsertByReferenceKey(userId, `review:${order.id}:${item.productId}`, {
          type: "REVIEW_PENDING",
          title: "Partagez votre avis",
          message: `Qu'avez-vous pensé de "${item.titleSnapshot}" ? Votre avis compte pour la communauté.`,
          actionUrl: `/produit/${item.productId}`,
          imageUrl: item.imageSnapshot,
        });
      }
    }

    const notifications = await notificationsRepository.findByUser(userId);
    return notifications.map(toNotificationDto);
  },

  async notifyOrderShipped(order: Order) {
    await notificationsRepository.upsertByReferenceKey(order.userId, `order:${order.id}:shipped`, {
      type: "ORDER_SHIPPED",
      title: "Commande expédiée",
      message: `Votre commande #${order.id.slice(-8).toUpperCase()} a été expédiée.`,
      actionUrl: `/compte/commandes/${order.id}`,
    });
  },

  async notifyOrderDelivered(order: Order) {
    await notificationsRepository.upsertByReferenceKey(order.userId, `order:${order.id}:delivered`, {
      type: "ORDER_DELIVERED",
      title: "Commande livrée",
      message: `Votre commande #${order.id.slice(-8).toUpperCase()} a été livrée. Bon shopping chez Lurevia !`,
      actionUrl: `/compte/commandes/${order.id}`,
    });
  },

  async markRead(userId: string, id: string) {
    await notificationsRepository.markRead(userId, id);
  },

  async markAllRead(userId: string) {
    await notificationsRepository.markAllRead(userId);
  },

  async clear(userId: string) {
    await notificationsRepository.deleteAllForUser(userId);
  },
};
