import { prisma } from "../../../lib/prisma";
import { type CreateAdminNotificationInput } from "../lib/type/admin.type";

export class AdminNotificationsRepository {
    create(data: CreateAdminNotificationInput) {
        return prisma.adminNotification.create({ data });
    }

    findMany(params: { skip: number; take: number; unreadOnly?: boolean; }) {
        return prisma.$transaction([
            prisma.adminNotification.findMany({
                where: params.unreadOnly ? { read: false } : undefined,
                orderBy: { createdAt: "desc" },
                skip: params.skip,
                take: params.take,
            }),
            prisma.adminNotification.count({ where: params.unreadOnly ? { read: false } : undefined }),
        ]);
    }

    countUnread() {
        return prisma.adminNotification.count({ where: { read: false } });
    }

    markRead(id: string) {
        return prisma.adminNotification.update({ where: { id }, data: { read: true } });
    }

    markAllRead() {
        return prisma.adminNotification.updateMany({ where: { read: false }, data: { read: true } });
    }
}

export const adminNotificationsRepository = new AdminNotificationsRepository();
