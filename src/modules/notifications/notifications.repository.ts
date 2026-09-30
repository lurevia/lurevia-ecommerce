import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const notificationsRepository = {
  // ─── Liste paginée ───
  findManyByUser: (userId: string, skip: number, take: number) =>
    prisma.$transaction([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.notification.count({ where: { userId } }),
    ]),

  // ─── Compteur non lues ───
  countUnread: (userId: string) =>
    prisma.notification.count({
      where: { userId, read: false },
    }),

  // ─── Upsert idempotent ───
  upsertByReferenceKey: (
    userId: string,
    referenceKey: string,
    data: Omit<Prisma.NotificationCreateInput, "user" | "referenceKey">
  ) =>
    prisma.notification.upsert({
      where: { userId_referenceKey: { userId, referenceKey } },
      update: {},
      create: { ...data, referenceKey, user: { connect: { id: userId } } },
    }),

  // ─── Marquage lu (avec readAt) ───
  markRead: (userId: string, id: string) =>
    prisma.notification.updateMany({
      where: { id, userId, read: false },
      data: { read: true, readAt: new Date() },
    }),

  markAllRead: (userId: string) =>
    prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    }),

  deleteAllForUser: (userId: string) =>
    prisma.notification.deleteMany({ where: { userId } }),

  // ─── Génération des rappels ───
  findDeliveredOrdersForUser: (userId: string, limit = 50) =>
    prisma.order.findMany({
      where: { userId, status: "DELIVERED" },
      include: { items: true },
      orderBy: { deliveredAt: "desc" },
      take: limit,
    }),

  findReviewedProductIds: (userId: string) =>
    prisma.productReview.findMany({
      where: { userId },
      select: { productId: true },
    }),

  // ─── Vérifications avant génération ───
  existsByReferenceKey: (userId: string, referenceKey: string) =>
    prisma.notification.findUnique({
      where: { userId_referenceKey: { userId, referenceKey } },
      select: { id: true },
    }),
};