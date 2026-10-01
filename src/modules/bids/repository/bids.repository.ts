import { Prisma, BidStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { bidUserSelect } from "../lib/constant/bids.constant";

export class BidsRepository {
    // ─── Création ───
    async create(data: Prisma.ProductBidCreateInput) {
        return prisma.productBid.create({
            data,
            include: {
                user: bidUserSelect,
                product: { select: { id: true, title: true, sku: true } },
            },
        });
    }

    // ─── Lecture ───
    async findById(id: string) {
        return prisma.productBid.findUnique({
            where: { id },
            include: {
                user: bidUserSelect,
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                        ownerId: true,
                        pricingMode: true,
                    },
                },
            },
        });
    }

    async findByProductId(productId: string, skip = 0, take = 50) {
        return prisma.$transaction([
            prisma.productBid.findMany({
                where: { productId },
                include: { user: bidUserSelect },
                orderBy: { proposedPrice: "desc" },
                skip,
                take,
            }),
            prisma.productBid.count({ where: { productId } }),
        ]);
    }

    async findByUserId(userId: string) {
        return prisma.productBid.findMany({
            where: { userId },
            include: {
                product: {
                    select: { id: true, title: true, sku: true, pricingMode: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async findWinningBidForProduct(productId: string) {
        return prisma.productBid.findFirst({
            where: { productId, isWinningBid: true },
            include: { user: bidUserSelect },
        });
    }

    async countActiveBidsForUser(userId: string, productId: string) {
        return prisma.productBid.count({
            where: {
                userId,
                productId,
                status: { in: ["PENDING", "WINNING"] },
            },
        });
    }

    async findPendingByUserIdAndProduct(userId: string, productId: string) {
        return prisma.productBid.findFirst({
            where: { userId, productId, status: "PENDING" },
        });
    }

    // ─── Mise à jour ───
    async updateStatus(id: string, status: BidStatus) {
        return prisma.productBid.update({
            where: { id },
            data: { status },
        });
    }

    // ✅ NOUVEAU — Marque une offre comme gagnante, retire les autres
    async markAsWinning(id: string) {
        return prisma.$transaction([
            prisma.productBid.updateMany({
                where: { productId: (await prisma.productBid.findUnique({ where: { id } }))!.productId, isWinningBid: true },
                data: { isWinningBid: false },
            }),
            prisma.productBid.update({
                where: { id },
                data: { isWinningBid: true, status: "WINNING" },
            }),
        ]);
    }
}

export const bidsRepository = new BidsRepository();
