import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const reviewsRepository = {
  findByProduct: (productId: string) =>
    prisma.productReview.findMany({
      where: { productId },
      include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),

  findByProductAndUser: (productId: string, userId: string) =>
    prisma.productReview.findUnique({ where: { productId_userId: { productId, userId } } }),

  findById: (id: string) => prisma.productReview.findUnique({ where: { id } }),

  create: (data: Prisma.ProductReviewCreateInput) => prisma.productReview.create({ data }),

  update: (id: string, data: Prisma.ProductReviewUpdateInput) =>
    prisma.productReview.update({ where: { id }, data }),

  delete: (id: string) => prisma.productReview.delete({ where: { id } }),

  distributionByProduct: (productId: string) =>
    prisma.productReview.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    }),

  /** Première commande de l'utilisateur contenant ce produit (pour l'éligibilité à l'avis). */
  findEarliestPurchase: (userId: string, productId: string) =>
    prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } },
      include: { order: true },
      orderBy: { order: { createdAt: "asc" } },
    }),
};
