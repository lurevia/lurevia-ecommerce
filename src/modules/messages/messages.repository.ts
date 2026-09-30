import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

const messageInclude = {
  sender: {
    select: { id: true, fullName: true, avatarUrl: true, role: true },
  },
} satisfies Prisma.UserMessageInclude;

export const messagesRepository = {
  // ─── Liste paginée ───
  findManyByRecipient: (
    recipientId: string,
    skip: number,
    take: number
  ) =>
    prisma.$transaction([
      prisma.userMessage.findMany({
        where: { recipientId },
        include: messageInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.userMessage.count({ where: { recipientId } }),
    ]),

  // ─── Détail ───
  findById: (id: string) =>
    prisma.userMessage.findUnique({
      where: { id },
      include: messageInclude,
    }),

  // ─── Marquage lu ───
  markRead: (id: string, recipientId: string) =>
    prisma.userMessage.updateMany({
      where: { id, recipientId },
      data: { read: true, readAt: new Date() },
    }),

  markAllRead: (recipientId: string) =>
    prisma.userMessage.updateMany({
      where: { recipientId, read: false },
      data: { read: true, readAt: new Date() },
    }),

  // ─── Compteur ───
  countUnread: (recipientId: string) =>
    prisma.userMessage.count({
      where: { recipientId, read: false },
    }),
};