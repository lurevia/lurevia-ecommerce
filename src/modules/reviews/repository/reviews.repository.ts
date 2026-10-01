import { prisma } from "../../../lib/prisma";
import type { Prisma } from "@prisma/client";
import { PURCHASE_STATUSES } from "../lib/constant/reviews.constant";

export class ReviewsRepository {
    // ─── Liste paginée (uniquement approuvés) ───
    findByProduct(productId: string, skip = 0, take = 20) {
        return prisma.$transaction([
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
        ]);
    }

    // ─── Avis de l'utilisateur sur un produit (peu importe statut) ───
    findByProductAndUser(productId: string, userId: string) {
        return prisma.productReview.findUnique({
            where: { productId_userId: { productId, userId } },
        });
    }

    findById(id: string) {
        return prisma.productReview.findUnique({ where: { id } });
    }

    // ─── Création (avec user inclus pour le DTO complet) ───
    create(data: Prisma.ProductReviewCreateInput) {
        return prisma.productReview.create({
            data,
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    // ─── Mise à jour ───
    update(id: string, data: Prisma.ProductReviewUpdateInput) {
        return prisma.productReview.update({
            where: { id },
            data,
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    delete(id: string) {
        return prisma.productReview.delete({ where: { id } });
    }

    // ─── Distribution des notes ───
    distributionByProduct(productId: string) {
        return prisma.productReview.groupBy({
            by: ["rating"],
            where: { productId, isApproved: true },
            _count: { rating: true },
        });
    }

    // ─── Éligibilité : première commande contenant le produit ───
    findEarliestPurchase(userId: string, productId: string) {
        return prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId,
                    status: { in: PURCHASE_STATUSES },
                },
            },
            include: { order: { select: { id: true, createdAt: true } } },
            orderBy: { order: { createdAt: "asc" } },
        });
    }
}

export const reviewsRepository = new ReviewsRepository();
