import { prisma } from "../../lib/prisma";
import type { Prisma, OrderStatus } from "@prisma/client";

/**
 * Statuts de commande considérés comme "acheté" pour l'éligibilité à un avis.
 * Inclut COD_PENDING car au moment de la commande, le client a fait l'engagement.
 */
const PURCHASE_STATUSES: OrderStatus[] = [
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "COD_PENDING",
  "COD_FAILED",
];

export const reviewsRepository = {
  // ─── Liste paginée (uniquement approuvés) ───
  findByProduct: (productId: string, skip = 0, take = 20) =>
    prisma.$transaction([
      prisma.productReview.findMany({
        where: { productId, isApproved: true },
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.productReview.count({
        where: { productId, isApproved: true },
      }),
    ]),

  // ─── Avis de l'utilisateur sur un produit (peu importe statut) ───
  findByProductAndUser: (productId: string, userId: string) =>
    prisma.productReview.findUnique({
      where: { productId_userId: { productId, userId } },
    }),

  findById: (id: string) =>
    prisma.productReview.findUnique({ where: { id } }),

  // ─── Création (avec user inclus pour le DTO complet) ───
  create: (data: Prisma.ProductReviewCreateInput) =>
    prisma.productReview.create({
      data,
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    }),

  // ─── Mise à jour ───
  update: (id: string, data: Prisma.ProductReviewUpdateInput) =>
    prisma.productReview.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    }),

  delete: (id: string) => prisma.productReview.delete({ where: { id } }),

  // ─── Distribution des notes ───
  distributionByProduct: (productId: string) =>
    prisma.productReview.groupBy({
      by: ["rating"],
      where: { productId, isApproved: true },
      _count: { rating: true },
    }),

  // ─── Éligibilité : première commande contenant le produit ───
  findEarliestPurchase: (userId: string, productId: string) =>
    prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: PURCHASE_STATUSES },
        },
      },
      include: { order: { select: { id: true, createdAt: true } } },
      orderBy: { order: { createdAt: "asc" } },
    }),
};