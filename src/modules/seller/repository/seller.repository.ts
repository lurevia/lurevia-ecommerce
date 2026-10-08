import { OrderStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { productDetailInclude } from "../../products/lib/constant/products.constant";
import type { Prisma } from "@prisma/client";

export class SellerRepository {
    publicProfiles(search: string | undefined, skip: number, take: number) {
        const where: Prisma.BoutiqueWhereInput = {
            isActive: true,
            deletedAt: null,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            } : {}),
        };
        return prisma.$transaction([
            prisma.boutique.findMany({
                where,
                select: {
                    id: true,
                    ownerId: true,
                    name: true,
                    description: true,
                    logoUrl: true,
                    coverUrl: true,
                    storeCategoryId: true,
                    storeCategory: { select: { id: true, name: true, slug: true } },
                    _count: { select: { products: { where: { isActive: true } } } },
                },
                orderBy: { name: "asc" },
                skip,
                take,
            }),
            prisma.boutique.count({ where }),
        ]);
    }

    publicProfile(id: string) {
        return prisma.boutique.findFirst({
            where: {
                OR: [{ id }, { ownerId: id }, { slug: id }],
                isActive: true,
                deletedAt: null,
            },
            select: {
                id: true,
                ownerId: true,
                name: true,
                description: true,
                logoUrl: true,
                coverUrl: true,
                storeCategoryId: true,
                storeCategory: { select: { id: true, name: true, slug: true } },
                products: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    include: productDetailInclude,
                },
            },
        });
    }

    products(ownerId: string, skip: number, take: number) {
        const where: Prisma.ProductWhereInput = { boutique: { ownerId } };
        return prisma.$transaction([
            prisma.product.findMany({ where, include: productDetailInclude, orderBy: { createdAt: "desc" }, skip, take }),
            prisma.product.count({ where }),
        ]);
    }

    orders(ownerId: string, skip: number, take: number) {
        const where: Prisma.OrderWhereInput = { items: { some: { product: { boutique: { ownerId } } } } };
        return prisma.$transaction([
            prisma.order.findMany({ where, include: { items: true, user: { select: { id: true, fullName: true, email: true } } }, orderBy: { createdAt: "desc" }, skip, take }),
            prisma.order.count({ where }),
        ]);
    }

    order(ownerId: string, id: string) {
        return prisma.order.findFirst({
            where: { id, items: { some: { product: { boutique: { ownerId } } } } },
            include: {
                items: { include: { product: { select: { boutique: { select: { ownerId: true } } } } } },
                user: { select: { id: true, fullName: true, email: true } },
            },
        });
    }

    feedback(ownerId: string) {
        return prisma.feedback.findMany({
            where: { OR: [{ boutique: { ownerId } }, { product: { boutique: { ownerId } } }] },
            include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
                product: { select: { id: true, title: true } },
                order: { select: { id: true, orderNumber: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async stats(ownerId: string) {
        const eligibleStatuses: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];
        const startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
        startDate.setUTCDate(startDate.getUTCDate() - 29);

        const [products, grouped, feedback, reviews, dailyOrders, pendingOrders, topProductGroups] = await Promise.all([
            prisma.product.count({ where: { boutique: { ownerId } } }),
            prisma.orderItem.findMany({
                where: { product: { boutique: { ownerId } }, order: { status: { in: eligibleStatuses } } },
                select: { quantity: true, priceSnapshot: true },
            }),
            prisma.feedback.aggregate({
                where: { type: "SERVICE", OR: [{ boutique: { ownerId } }, { product: { boutique: { ownerId } } }] },
                _avg: { rating: true },
                _count: true,
            }),
            prisma.feedback.aggregate({
                where: { type: "PRODUCT", product: { boutique: { ownerId } } },
                _avg: { rating: true },
                _count: true,
            }),
            prisma.order.findMany({
                where: {
                    status: { in: eligibleStatuses },
                    createdAt: { gte: startDate },
                    items: { some: { product: { boutique: { ownerId } } } },
                },
                select: {
                    id: true,
                    createdAt: true,
                    items: {
                        where: { product: { boutique: { ownerId } } },
                        select: { quantity: true, priceSnapshot: true },
                    },
                },
            }),
            prisma.order.count({
                where: {
                    status: { in: ["PENDING", "COD_PENDING"] },
                    items: { some: { product: { boutique: { ownerId } } } },
                },
            }),
            prisma.orderItem.groupBy({
                by: ["productId"],
                where: { product: { boutique: { ownerId } }, order: { status: { in: eligibleStatuses } } },
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
                (sum: number, item: { quantity: number; priceSnapshot: number }) => sum + item.quantity * item.priceSnapshot,
                0
            );
        }

        const topProductIds = topProductGroups.map((item: { productId: string }) => item.productId);
        const topProductRecords = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, title: true, images: { orderBy: { position: "asc" }, take: 1, select: { url: true } } },
        });
        const topProductMap = new Map(topProductRecords.map((product) => [product.id, product]));

        return {
            products,
            sales: grouped.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
            revenue: grouped.reduce((sum: number, item: { quantity: number; priceSnapshot: number }) => sum + item.quantity * item.priceSnapshot, 0),
            pendingOrders,
            daily: Array.from(dailyMap, ([date, day]) => ({
                date,
                sales: day.orderIds.size,
                revenue: day.revenue,
            })),
            topProducts: topProductGroups.flatMap((item: { productId: string; _sum?: { quantity: number | null } }) => {
                const product = topProductMap.get(item.productId);
                return product ? [{
                    id: product.id,
                    title: product.title,
                    unitsSold: item._sum?.quantity ?? 0,
                    imageUrl: product.images[0]?.url ?? null,
                }] : [];
            }),
            feedbackCount: feedback._count,
            feedbackAverage: feedback._avg.rating ?? 0,
            reviewCount: reviews._count,
            reviewAverage: reviews._avg.rating ?? 0,
        };
    }
}

export const sellerRepository = new SellerRepository();
