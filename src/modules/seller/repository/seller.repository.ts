import { OrderStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { productDetailInclude } from "../../products/lib/constant/products.constant";
import type { Prisma } from "@prisma/client";

export class SellerRepository {
    publicProfiles(search: string | undefined, skip: number, take: number) {
        const where: Prisma.UserWhereInput = {
            role: "SELLER",
            isVerified: true,
            isActive: true,
            deletedAt: null,
            publicStoreName: { not: null },
            ...(search ? {
                OR: [
                    { publicStoreName: { contains: search, mode: "insensitive" } },
                    { publicStoreDescription: { contains: search, mode: "insensitive" } },
                ],
            } : {}),
        };
        return prisma.$transaction([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    publicStoreName: true,
                    publicStoreDescription: true,
                    publicStoreLogoUrl: true,
                    storeCategoryId: true,
                    storeCategory: { select: { id: true, name: true, slug: true } },
                    _count: { select: { ownedProducts: { where: { isActive: true } } } },
                },
                orderBy: { publicStoreName: "asc" },
                skip,
                take,
            }),
            prisma.user.count({ where }),
        ]);
    }

    publicProfile(id: string) {
        return prisma.user.findFirst({
            where: {
                id,
                role: "SELLER",
                isVerified: true,
                isActive: true,
                deletedAt: null,
                publicStoreName: { not: null },
            },
            select: {
                id: true,
                publicStoreName: true,
                publicStoreDescription: true,
                publicStoreLogoUrl: true,
                storeCategoryId: true,
                storeCategory: { select: { id: true, name: true, slug: true } },
                ownedProducts: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    include: productDetailInclude,
                },
            },
        });
    }

    products(ownerId: string, skip: number, take: number) {
        return prisma.$transaction([
            prisma.product.findMany({ where: { ownerId }, include: productDetailInclude, orderBy: { createdAt: "desc" }, skip, take }),
            prisma.product.count({ where: { ownerId } }),
        ]);
    }

    orders(ownerId: string, skip: number, take: number) {
        return prisma.$transaction([
            prisma.order.findMany({ where: { items: { some: { product: { ownerId } } } }, include: { items: true, user: { select: { id: true, fullName: true, email: true } } }, orderBy: { createdAt: "desc" }, skip, take }),
            prisma.order.count({ where: { items: { some: { product: { ownerId } } } } }),
        ]);
    }

    order(ownerId: string, id: string) {
        return prisma.order.findFirst({ where: { id, items: { some: { product: { ownerId } } } }, include: { items: { include: { product: { select: { ownerId: true } } } }, user: { select: { id: true, fullName: true, email: true } } } });
    }

    feedback(ownerId: string) {
        return prisma.serviceFeedback.findMany({
            where: { OR: [{ product: { ownerId } }, { order: { items: { some: { product: { ownerId } } } } }] },
            include: { user: { select: { id: true, fullName: true, avatarUrl: true } }, product: { select: { id: true, title: true } }, order: { select: { id: true, orderNumber: true } } },
            orderBy: { createdAt: "desc" },
        });
    }

    async stats(ownerId: string) {
        const eligibleStatuses: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];
        const startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
        startDate.setUTCDate(startDate.getUTCDate() - 29);

        const [products, grouped, feedback, reviews, dailyOrders, pendingOrders, topProductGroups] = await Promise.all([
            prisma.product.count({ where: { ownerId } }),
            prisma.orderItem.findMany({
                where: { product: { ownerId }, order: { status: { in: eligibleStatuses } } },
                select: { quantity: true, priceSnapshot: true },
            }),
            prisma.serviceFeedback.aggregate({ where: { OR: [{ product: { ownerId } }, { order: { items: { some: { product: { ownerId } } } } }] }, _avg: { overallRating: true }, _count: true }),
            prisma.productReview.aggregate({ where: { product: { ownerId } }, _avg: { rating: true }, _count: true }),
            prisma.order.findMany({
                where: {
                    status: { in: eligibleStatuses },
                    createdAt: { gte: startDate },
                    items: { some: { product: { ownerId } } },
                },
                select: {
                    id: true,
                    createdAt: true,
                    items: {
                        where: { product: { ownerId } },
                        select: { quantity: true, priceSnapshot: true },
                    },
                },
            }),
            prisma.order.count({
                where: {
                    status: { in: ["PENDING", "COD_PENDING"] },
                    items: { some: { product: { ownerId } } },
                },
            }),
            prisma.orderItem.groupBy({
                by: ["productId"],
                where: { product: { ownerId }, order: { status: { in: eligibleStatuses } } },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 5,
            }),
        ]);

        const dailyMap = new Map<string, { orderIds: Set<string>; revenue: number }>();
        for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
            const date = new Date(startDate);
            date.setUTCDate(date.getUTCDate() + dayOffset);
            dailyMap.set(date.toISOString().slice(0, 10), { orderIds: new Set(), revenue: 0 });
        }
        for (const order of dailyOrders) {
            const dateKey = order.createdAt.toISOString().slice(0, 10);
            const day = dailyMap.get(dateKey);
            if (!day) continue;
            day.orderIds.add(order.id);
            day.revenue += order.items.reduce(
                (sum, item) => sum + item.quantity * item.priceSnapshot,
                0
            );
        }

        const topProductIds = topProductGroups.map((item) => item.productId);
        const topProductRecords = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, title: true, images: { orderBy: { position: "asc" }, take: 1, select: { url: true } } },
        });
        const topProductMap = new Map(topProductRecords.map((product) => [product.id, product]));

        return {
            products,
            sales: grouped.reduce((sum, item) => sum + item.quantity, 0),
            revenue: grouped.reduce((sum, item) => sum + item.quantity * item.priceSnapshot, 0),
            pendingOrders,
            daily: Array.from(dailyMap, ([date, day]) => ({
                date,
                sales: day.orderIds.size,
                revenue: day.revenue,
            })),
            topProducts: topProductGroups.flatMap((item) => {
                const product = topProductMap.get(item.productId);
                return product ? [{
                    id: product.id,
                    title: product.title,
                    unitsSold: item._sum?.quantity ?? 0,
                    imageUrl: product.images[0]?.url ?? null,
                }] : [];
            }),
            feedbackCount: feedback._count,
            feedbackAverage: feedback._avg.overallRating ?? 0,
            reviewCount: reviews._count,
            reviewAverage: reviews._avg.rating ?? 0,
        };
    }
}

export const sellerRepository = new SellerRepository();
