import { prisma } from "../../lib/prisma";
import type { AdminNotificationType } from "@prisma/client";

export interface CreateAdminNotificationInput {
  type: AdminNotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  actorUserId?: string;
}

export const adminNotificationsRepository = {
  create: (data: CreateAdminNotificationInput) => prisma.adminNotification.create({ data }),

  findMany: (params: { skip: number; take: number; unreadOnly?: boolean }) =>
    prisma.$transaction([
      prisma.adminNotification.findMany({
        where: params.unreadOnly ? { read: false } : undefined,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.adminNotification.count({ where: params.unreadOnly ? { read: false } : undefined }),
    ]),

  countUnread: () => prisma.adminNotification.count({ where: { read: false } }),

  markRead: (id: string) =>
    prisma.adminNotification.update({ where: { id }, data: { read: true } }),

  markAllRead: () =>
    prisma.adminNotification.updateMany({ where: { read: false }, data: { read: true } }),
};
