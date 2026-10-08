import { prisma } from "../../../lib/prisma";
import type { FeedbackCategory } from "@prisma/client";

const toRow = (item: any) => {
    if (!item) return null;
    return {
        ...item,
        overallRating: item.rating,
        teamResponse: item.officialReply ?? null,
    };
};

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
    async findManyPublic(skip: number, take: number) {
        const [items, count] = await prisma.$transaction([
            prisma.feedback.findMany({
                where: { type: "SERVICE", isApproved: true },
                include: {
                    user: { select: { id: true, fullName: true, avatarUrl: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.feedback.count({ where: { type: "SERVICE", isApproved: true } }),
        ]);
        return [items.map(toRow), count] as const;
    }

    // ─── Liste personnelle (paginated, tous statuts) ───
    async findManyByUser(userId: string, skip = 0, take = 20) {
        const [items, count] = await prisma.$transaction([
            prisma.feedback.findMany({
                where: { userId, type: "SERVICE" },
                include: {
                    user: { select: { id: true, fullName: true, avatarUrl: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.feedback.count({ where: { userId, type: "SERVICE" } }),
        ]);
        return [items.map(toRow), count] as const;
    }

    async findById(id: string) {
        const item = await prisma.feedback.findUnique({ where: { id } });
        return toRow(item);
    }

    // ✅ Inclut la relation user pour construire un DTO complet
    async findByIdWithUser(id: string) {
        const item = await prisma.feedback.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
        return toRow(item);
    }

    async create(data: {
        user: { connect: { id: string } };
        overallRating?: number;
        rating?: number;
        criteria?: any;
        category?: FeedbackCategory;
        comment: string;
        orderId?: string | null;
        productId?: string | null;
    }) {
        const item = await prisma.feedback.create({
            data: {
                type: "SERVICE",
                userId: data.user.connect.id,
                rating: data.overallRating ?? data.rating ?? 5,
                criteria: data.criteria,
                category: data.category,
                comment: data.comment,
                orderId: data.orderId ?? null,
                productId: data.productId ?? null,
            },
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
        return toRow(item);
    }

    async update(id: string, data: { rating?: number; overallRating?: number; criteria?: any; category?: FeedbackCategory; comment?: string }) {
        const item = await prisma.feedback.update({
            where: { id },
            data: {
                ...(data.rating !== undefined || data.overallRating !== undefined
                    ? { rating: data.overallRating ?? data.rating }
                    : {}),
                ...(data.criteria !== undefined ? { criteria: data.criteria } : {}),
                ...(data.category !== undefined ? { category: data.category } : {}),
                ...(data.comment !== undefined ? { comment: data.comment } : {}),
            },
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
        return toRow(item);
    }

    delete(id: string) {
        return prisma.feedback.delete({ where: { id } });
    }

    // ✅ Stats sur les feedbacks approuvés uniquement
    aggregateStats() {
        return prisma.feedback.aggregate({
            where: { type: "SERVICE", isApproved: true },
            _avg: { rating: true },
            _count: true,
        });
    }
}

export const feedbackRepository = new FeedbackRepository();
