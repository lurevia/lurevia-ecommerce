import { prisma } from "../../../lib/prisma";
import type { Prisma } from "@prisma/client";

export class FeedbackRepository {
    // ─── Vérifications d'appartenance ───
    findOrderForUser(orderId: string, userId: string) {
        return prisma.order.findFirst({
            where: { id: orderId, userId },
            select: {
                id: true,
                items: { select: { productId: true } },
            },
        });
    }

    findPurchasedProduct(productId: string, userId: string) {
        return prisma.orderItem.findFirst({
            where: { productId, order: { userId } },
            select: { productId: true },
        });
    }

    // ─── Liste publique (UNIQUEMENT approuvés) ───
    findManyPublic(skip: number, take: number) {
        return prisma.$transaction([
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
        ]);
    }

    // ─── Liste personnelle (paginated, tous statuts) ───
    findManyByUser(userId: string, skip = 0, take = 20) {
        return prisma.$transaction([
            prisma.serviceFeedback.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.serviceFeedback.count({ where: { userId } }),
        ]);
    }

    findById(id: string) {
        return prisma.serviceFeedback.findUnique({ where: { id } });
    }

    // ✅ Inclut la relation user pour construire un DTO complet
    findByIdWithUser(id: string) {
        return prisma.serviceFeedback.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    create(data: Prisma.ServiceFeedbackCreateInput) {
        return prisma.serviceFeedback.create({
            data,
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    update(id: string, data: Prisma.ServiceFeedbackUpdateInput) {
        return prisma.serviceFeedback.update({
            where: { id },
            data,
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
    }

    delete(id: string) {
        return prisma.serviceFeedback.delete({ where: { id } });
    }

    // ✅ Stats sur les feedbacks approuvés uniquement
    aggregateStats() {
        return prisma.serviceFeedback.aggregate({
            where: { isApproved: true },
            _avg: { overallRating: true },
            _count: true,
        });
    }
}

export const feedbackRepository = new FeedbackRepository();
