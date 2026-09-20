import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const notificationsRepository = {
  findByUser: (userId: string) =>
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),

  /** Idempotent : ne crée rien si une notification avec la même clé de référence existe déjà. */
  upsertByReferenceKey: (userId: string, referenceKey: string, data: Omit<Prisma.NotificationCreateInput, "user" | "referenceKey">) =>
    prisma.notification.upsert({
      where: { userId_referenceKey: { userId, referenceKey } },
      update: {},
      create: { ...data, referenceKey, user: { connect: { id: userId } } },
    }),

  markRead: (userId: string, id: string) =>
    prisma.notification.updateMany({ where: { id, userId }, data: { read: true } }),

  markAllRead: (userId: string) =>
    prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } }),

  deleteAllForUser: (userId: string) => prisma.notification.deleteMany({ where: { userId } }),

  /** Commandes livrées de l'utilisateur, utilisées pour générer les rappels d'avis. */
  findDeliveredOrdersForUser: (userId: string) =>
    prisma.order.findMany({
      where: { userId, status: "DELIVERED" },
      include: { items: true },
    }),

  findReviewedProductIds: (userId: string) =>
    prisma.productReview.findMany({ where: { userId }, select: { productId: true } }),
};
