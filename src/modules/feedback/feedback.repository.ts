import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const feedbackRepository = {
  findOrderForUser: (orderId: string, userId: string) =>
    prisma.order.findFirst({ where: { id: orderId, userId }, select: { id: true, items: { select: { productId: true } } } }),
  findPurchasedProduct: (productId: string, userId: string) =>
    prisma.orderItem.findFirst({ where: { productId, order: { userId } }, select: { productId: true } }),
  findManyPublic: (skip: number, take: number) =>
    prisma.$transaction([
      prisma.serviceFeedback.findMany({
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.serviceFeedback.count(),
    ]),

  findManyByUser: (userId: string) =>
    prisma.serviceFeedback.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),

  findById: (id: string) => prisma.serviceFeedback.findUnique({ where: { id } }),

  create: (data: Prisma.ServiceFeedbackCreateInput) => prisma.serviceFeedback.create({ data }),

  update: (id: string, data: Prisma.ServiceFeedbackUpdateInput) =>
    prisma.serviceFeedback.update({ where: { id }, data }),

  delete: (id: string) => prisma.serviceFeedback.delete({ where: { id } }),

  aggregateStats: () => prisma.serviceFeedback.aggregate({ _avg: { overallRating: true }, _count: true }),
};
