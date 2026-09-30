import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const feedbackRepository = {
  // ─── Vérifications d'appartenance ───
  findOrderForUser: (orderId: string, userId: string) =>
    prisma.order.findFirst({
      where: { id: orderId, userId },
      select: {
        id: true,
        items: { select: { productId: true } },
      },
    }),

  findPurchasedProduct: (productId: string, userId: string) =>
    prisma.orderItem.findFirst({
      where: { productId, order: { userId } },
      select: { productId: true },
    }),

  // ─── Liste publique (UNIQUEMENT approuvés) ───
  findManyPublic: (skip: number, take: number) =>
    prisma.$transaction([
      prisma.serviceFeedback.findMany({
        where: { isApproved: true }, // ✅ CRITIQUE
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.serviceFeedback.count({ where: { isApproved: true } }),
    ]),

  // ─── Liste personnelle (paginated, tous statuts) ───
  findManyByUser: (userId: string, skip = 0, take = 20) =>
    prisma.$transaction([
      prisma.serviceFeedback.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.serviceFeedback.count({ where: { userId } }),
    ]),

  findById: (id: string) =>
    prisma.serviceFeedback.findUnique({ where: { id } }),

  // ✅ Inclut la relation user pour construire un DTO complet
  findByIdWithUser: (id: string) =>
    prisma.serviceFeedback.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    }),

  create: (data: Prisma.ServiceFeedbackCreateInput) =>
    prisma.serviceFeedback.create({
      data,
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    }),

  update: (id: string, data: Prisma.ServiceFeedbackUpdateInput) =>
    prisma.serviceFeedback.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    }),

  delete: (id: string) =>
    prisma.serviceFeedback.delete({ where: { id } }),

  // ✅ Stats sur les feedbacks approuvés uniquement
  aggregateStats: () =>
    prisma.serviceFeedback.aggregate({
      where: { isApproved: true },
      _avg: { overallRating: true },
      _count: true,
    }),
};