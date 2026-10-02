import { prisma } from "../../../lib/prisma";
import type { DeletionRequestStatus, FeedbackCategory, OrderStatus, PaymentMethod, Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { orderDetailInclude } from "../../orders/lib/constant/orders.constant";

export class AdminRepository {
    // ── Tableau de bord ──────────────────────────────────────────────
    async stats() {
        const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            newUsers7d,
            totalProducts,
            lowStockProducts,
            pendingOrders,
            revenue30dAgg,
            orders30dCount,
            pendingReviewsCount,
            pendingIdentityVerifications,
            pendingDeletionRequests,
            unreadAdminNotifications,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "CUSTOMER" } }),
            prisma.user.count({
                where: { role: "CUSTOMER", createdAt: { gte: since7d } },
            }),
            prisma.product.count(),
            prisma.product.count({ where: { stock: { lte: 5 } } }),
            prisma.order.count({ where: { status: "PENDING" } }),
            prisma.order.aggregate({
                _sum: { total: true },
                where: {
                    createdAt: { gte: since30d },
                    status: { not: "CANCELLED" },
                },
            }),
            prisma.order.count({ where: { createdAt: { gte: since30d } } }),
            prisma.productReview.count({
                where: { isApproved: false, rejectedAt: null },
            }),
            prisma.identityVerification.count({ where: { status: "PENDING" } }),
            prisma.accountDeletionRequest.count({ where: { status: "PENDING" } }),
            prisma.adminNotification.count({ where: { read: false } }),
        ]);

            const completedOrderStatuses: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];
            const [ordersByStatusRows, chartItems, topProductGroups, paymentMethodRows, newCustomers, totalReviews] = await Promise.all([
                prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
                prisma.orderItem.findMany({
                    where: {
                        order: { status: { in: completedOrderStatuses }, createdAt: { gte: since30d } },
                    },
                    select: {
                        quantity: true,
                        priceSnapshot: true,
                        order: { select: { createdAt: true } },
                        product: {
                            select: {
                                categories: { select: { category: { select: { name: true } } } },
                            },
                        },
                    },
                }),
                prisma.orderItem.groupBy({
                    by: ["productId"],
                    where: { order: { status: { in: completedOrderStatuses } } },
                    _sum: { quantity: true },
                    orderBy: { _sum: { quantity: "desc" } },
                    take: 5,
                }),
                prisma.transaction.groupBy({
                    by: ["method"],
                    where: { status: "SUCCESS" },
                    _count: { _all: true },
                }),
                prisma.user.findMany({
                    where: { role: "CUSTOMER", createdAt: { gte: since7d } },
                    select: { createdAt: true },
                }),
                prisma.productReview.count(),
            ]);

            const startOfToday = new Date();
            startOfToday.setUTCHours(0, 0, 0, 0);
            const formatChartDate = (date: Date) =>
                new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date);
            const revenueByDate = new Map<string, number>();
            for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 1) {
                const date = new Date(startOfToday);
                date.setUTCDate(date.getUTCDate() - dayOffset);
                revenueByDate.set(formatChartDate(date), 0);
            }
            const salesByCategoryMap = new Map<string, number>();
            for (const item of chartItems) {
                const dateLabel = formatChartDate(item.order.createdAt);
                if (revenueByDate.has(dateLabel)) {
                    revenueByDate.set(
                        dateLabel,
                        (revenueByDate.get(dateLabel) ?? 0) + item.quantity * item.priceSnapshot
                    );
                }
                const categoryName = item.product.categories[0]?.category.name ?? "Sans catégorie";
                salesByCategoryMap.set(
                    categoryName,
                    (salesByCategoryMap.get(categoryName) ?? 0) + item.quantity * item.priceSnapshot
                );
            }

            const topProductRecords = await prisma.product.findMany({
                where: { id: { in: topProductGroups.map((item) => item.productId) } },
                select: { id: true, title: true },
            });
            const topProductNames = new Map(topProductRecords.map((product) => [product.id, product.title]));
            const userGrowthMap = new Map<string, number>();
            for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
                const date = new Date(startOfToday);
                date.setUTCDate(date.getUTCDate() - dayOffset);
                userGrowthMap.set(formatChartDate(date), 0);
            }
            for (const customer of newCustomers) {
                const dateLabel = formatChartDate(customer.createdAt);
                if (userGrowthMap.has(dateLabel)) {
                    userGrowthMap.set(dateLabel, (userGrowthMap.get(dateLabel) ?? 0) + 1);
                }
            }

        return {
            totalUsers,
            newUsers7d,
            totalProducts,
            lowStockProducts,
            pendingOrders,
            revenue30d: revenue30dAgg._sum.total ?? 0,
            orders30dCount,
            pendingReviewsCount,
            pendingIdentityVerifications,
            pendingDeletionRequests,
            unreadAdminNotifications,
                totalReviews,
                revenueSeries: Array.from(revenueByDate, ([date, revenue]) => ({ date, revenue })),
                ordersByStatus: ordersByStatusRows.map((item) => ({
                    status: item.status,
                    count: item._count._all,
                })),
                topProducts: topProductGroups.flatMap((item) => {
                    const name = topProductNames.get(item.productId);
                    return name ? [{ name, sales: item._sum.quantity ?? 0 }] : [];
                }),
                salesByCategory: Array.from(salesByCategoryMap, ([name, value]) => ({ name, value })),
                paymentMethods: paymentMethodRows.map((item) => ({
                    name: item.method.replaceAll("_", " "),
                    value: item._count._all,
                })),
                userGrowth: Array.from(userGrowthMap, ([date, users]) => ({ date, users })),
        };
    }

    // ── Commandes ────────────────────────────────────────────────────
    findManyOrders(params: {
        skip: number;
        take: number;
        status?: OrderStatus;
        paymentMethod?: PaymentMethod;
        search?: string;
    }) {
        const where = {
            ...(params.status ? { status: params.status } : {}),
            ...(params.paymentMethod ? { paymentMethod: params.paymentMethod } : {}),
            ...(params.search
                ? {
                    OR: [
                        { orderNumber: { contains: params.search, mode: "insensitive" as const } },
                        { id: { contains: params.search, mode: "insensitive" as const } },
                        { shippingFullName: { contains: params.search, mode: "insensitive" as const } },
                        { shippingEmail: { contains: params.search, mode: "insensitive" as const } },
                    ],
                }
                : {}),
        };
        return prisma.$transaction([
            prisma.order.findMany({
                where,
                include: orderDetailInclude,
                orderBy: { createdAt: "desc" },
                skip: params.skip,
                take: params.take,
            }),
            prisma.order.count({ where }),
        ]);
    }

    findOrderById(id: string) {
        return prisma.order.findUnique({ where: { id }, include: orderDetailInclude });
    }

    // ── Utilisateurs ─────────────────────────────────────────────────
    findManyUsers(params: {
        skip: number;
        take: number;
        search?: string;
        role?: "CUSTOMER" | "SELLER" | "ADMIN";
        gender?: "MALE" | "FEMALE" | "OTHER";
        age?: string;
        sortField: "createdAt" | "fullName" | "ordersCount";
        sortOrder: "ASC" | "DESC";
    }) {
        const direction = params.sortOrder === "ASC" ? "asc" : "desc";
        const primaryOrder: Prisma.UserOrderByWithRelationInput =
            params.sortField === "ordersCount"
                ? { orders: { _count: direction } }
                : params.sortField === "fullName"
                    ? { fullName: direction }
                    : { createdAt: direction };
        const where = {
            ...(params.role ? { role: params.role } : {}),
            ...(params.gender ? { gender: params.gender } : {}),
            ...(params.age === "unknown"
                ? { age: null }
                : params.age
                    ? {
                        age: {
                            gte: Number(params.age.split("-")[0]),
                            lte: Number(params.age.split("-")[1]),
                        },
                    }
                    : {}),
            ...(params.search
                ? {
                    OR: [
                        { fullName: { contains: params.search, mode: "insensitive" as const } },
                        { email: { contains: params.search, mode: "insensitive" as const } },
                        { phone: { contains: params.search, mode: "insensitive" as const } },
                    ],
                }
                : {}),
        };
        return prisma.$transaction([
            prisma.user.findMany({
                where,
                orderBy: [primaryOrder, { id: "asc" }],
                skip: params.skip,
                take: params.take,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    avatarUrl: true,
                    age: true,
                    gender: true,
                    isVerified: true,
                    isActive: true,
                    createdAt: true,
                    lastLoginAt: true,
                    _count: { select: { orders: true } },
                },
            }),
            prisma.user.count({ where }),
        ]);
    }

    findUserById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                avatarUrl: true,
                age: true,
                gender: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
                _count: { select: { orders: true } },
            },
        });
    }

    updateUserRole(id: string, role: Role) {
        return prisma.user.update({ where: { id }, data: { role } });
    }

    deleteUser(id: string) {
        return prisma.user.delete({ where: { id } });
    }

    // ── Avis ─────────────────────────────────────────────────────────
    findManyReviews(params: {
        skip: number;
        take: number;
        productId?: string;
        search?: string;
        status?: "pending" | "approved" | "rejected";
        rating?: number;
    }) {
        const where = {
            ...(params.productId ? { productId: params.productId } : {}),
            ...(params.rating ? { rating: params.rating } : {}),
            ...(params.status === "pending"
                ? { isApproved: false, rejectedAt: null }
                : {}),
            ...(params.status === "approved" ? { isApproved: true } : {}),
            ...(params.status === "rejected" ? { rejectedAt: { not: null } } : {}),
            ...(params.search
                ? {
                    OR: [
                        { comment: { contains: params.search, mode: "insensitive" as const } },
                        { title: { contains: params.search, mode: "insensitive" as const } },
                        {
                            user: {
                                fullName: { contains: params.search, mode: "insensitive" as const },
                            },
                        },
                        {
                            product: {
                                title: { contains: params.search, mode: "insensitive" as const },
                            },
                        },
                    ],
                }
                : {}),
        };
        return prisma.$transaction([
            prisma.productReview.findMany({
                where,
                include: {
                    user: { select: { fullName: true, email: true, avatarUrl: true } },
                    product: { select: { title: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: params.skip,
                take: params.take,
            }),
            prisma.productReview.count({ where }),
        ]);
    }

    findReviewById(id: string) {
        return prisma.productReview.findUnique({ where: { id } });
    }

    deleteReview(id: string) {
        return prisma.productReview.delete({ where: { id } });
    }

    // ── Feedback ─────────────────────────────────────────────────────
    findManyFeedback(params: {
        skip: number;
        take: number;
        category?: FeedbackCategory;
    }) {
        const where = params.category ? { category: params.category } : {};
        return prisma.$transaction([
            prisma.serviceFeedback.findMany({
                where,
                include: { user: { select: { fullName: true, email: true } } },
                orderBy: { createdAt: "desc" },
                skip: params.skip,
                take: params.take,
            }),
            prisma.serviceFeedback.count({ where }),
        ]);
    }

    findFeedbackById(id: string) {
        return prisma.serviceFeedback.findUnique({ where: { id } });
    }

    updateFeedbackResponse(id: string, teamResponse: string) {
        return prisma.serviceFeedback.update({ where: { id }, data: { teamResponse } });
    }

    deleteFeedback(id: string) {
        return prisma.serviceFeedback.delete({ where: { id } });
    }

    // ── Suppression de compte ────────────────────────────────────────
    findManyDeletionRequests(params: {
        skip: number;
        take: number;
        status?: DeletionRequestStatus;
        search?: string;
    }) {
        const where = {
            ...(params.status ? { status: params.status } : {}),
            ...(params.search
                ? {
                    user: {
                        OR: [
                            { fullName: { contains: params.search, mode: "insensitive" as const } },
                            { email: { contains: params.search, mode: "insensitive" as const } },
                        ],
                    },
                }
                : {}),
        };
        return prisma.$transaction([
            prisma.accountDeletionRequest.findMany({
                where,
                include: {
                    user: {
                        select: { fullName: true, email: true, phone: true, avatarUrl: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: params.skip,
                take: params.take,
            }),
            prisma.accountDeletionRequest.count({ where }),
        ]);
    }

    findDeletionRequestById(id: string) {
        return prisma.accountDeletionRequest.findUnique({ where: { id } });
    }

    updateDeletionRequestStatus(id: string,
        status: DeletionRequestStatus,
        adminNote?: string) {
        return prisma.accountDeletionRequest.update({
            where: { id },
            data: { status, adminNote, processedAt: new Date() },
        });
    }
}

export const adminRepository = new AdminRepository();
