import { prisma } from "../../../lib/prisma";
import { PURCHASE_STATUSES } from "../lib/constant/reviews.constant";

export class ReviewsRepository {
    // ─── Liste paginée (uniquement approuvés) ───
    findByProduct(productId: string, skip = 0, take = 20) {
        return prisma.$transaction([
            prisma.feedback.findMany({
                where: { productId, type: "PRODUCT", isApproved: true },
                include: {
                    user: { select: { id: true, fullName: true, avatarUrl: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.feedback.count({
                where: { productId, type: "PRODUCT", isApproved: true },
            }),
        ]);
    }

    // ─── Avis de l'utilisateur sur un produit (peu importe statut) ───
    findByProductAndUser(productId: string, userId: string) {
        return prisma.feedback.findFirst({
            where: { productId, userId, type: "PRODUCT" },
        });
    }

    findById(id: string) {
        return prisma.feedback.findUnique({ where: { id } });
    }

    // ─── Création (avec user inclus pour le DTO complet) ───
    create(data: {
        product: { connect: { id: string } };
        user: { connect: { id: string } };
        rating: number;
        title?: string;
        comment: string;
        isVerifiedPurchase?: boolean;
    }) {
        return prisma.feedback.create({
            data: {
                type: "PRODUCT",
                productId: data.product.connect.id,
                userId: data.user.connect.id,
                rating: data.rating,
                title: data.title,
                comment: data.comment,
            },
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    // ─── Mise à jour ───
    update(id: string, data: { rating?: number; title?: string; comment?: string }) {
        return prisma.feedback.update({
            where: { id },
            data,
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    delete(id: string) {
        return prisma.feedback.delete({ where: { id } });
    }

    // ─── Distribution des notes ───
    distributionByProduct(productId: string) {
        return prisma.feedback.groupBy({
            by: ["rating"],
            where: { productId, type: "PRODUCT", isApproved: true },
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
