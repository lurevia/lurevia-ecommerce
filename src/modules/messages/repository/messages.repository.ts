import { prisma } from "../../../lib/prisma";
import { messageInclude } from "../lib/constant/messages.constant";

export class MessagesRepository {
    // ─── Liste paginée ───
    findManyByRecipient(recipientId: string,
        skip: number,
        take: number) {
        return prisma.$transaction([
            prisma.userMessage.findMany({
                where: { recipientId },
                include: messageInclude,
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.userMessage.count({ where: { recipientId } }),
        ]);
    }

    // ─── Détail ───
    findById(id: string) {
        return prisma.userMessage.findUnique({
            where: { id },
            include: messageInclude,
        });
    }

    // ─── Marquage lu ───
    markRead(id: string, recipientId: string) {
        return prisma.userMessage.updateMany({
            where: { id, recipientId },
            data: { read: true, readAt: new Date() },
        });
    }

    markAllRead(recipientId: string) {
        return prisma.userMessage.updateMany({
            where: { recipientId, read: false },
            data: { read: true, readAt: new Date() },
        });
    }

    // ─── Compteur ───
    countUnread(recipientId: string) {
        return prisma.userMessage.count({
            where: { recipientId, read: false },
        });
    }
}

export const messagesRepository = new MessagesRepository();
