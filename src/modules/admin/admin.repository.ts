import { prisma } from "../../lib/prisma";
import type { DeletionRequestStatus, FeedbackCategory, OrderStatus } from "@prisma/client";
import { orderDetailInclude } from "../orders/orders.repository";

export const adminRepository = {
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
      pendingDeletionRequests,
      unreadAdminNotifications,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since7d } } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: since30d }, status: { not: "CANCELLED" } },
      }),
      prisma.order.count({ where: { createdAt: { gte: since30d } } }),
      // "En attente de modération" : approximé par les avis créés récemment,
      // faute d'un champ de statut dédié dans le schéma actuel.
      prisma.productReview.count(),
      prisma.accountDeletionRequest.count({ where: { status: "PENDING" } }),
      prisma.adminNotification.count({ where: { read: false } }),
    ]);

    return {
      totalUsers,
      newUsers7d,
      totalProducts,
      lowStockProducts,
      pendingOrders,
      revenue30d: revenue30dAgg._sum.total ?? 0,
      orders30dCount,
      totalReviews: pendingReviewsCount,
      pendingDeletionRequests,
      unreadAdminNotifications,
    };
  },

  // ── Commandes (toutes) ───────────────────────────────────────────
  findManyOrders: (params: { skip: number; take: number; status?: OrderStatus; search?: string }) => {
    const where = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
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
  },

  findOrderById: (id: string) =>
    prisma.order.findUnique({ where: { id }, include: orderDetailInclude }),

  // ── Utilisateurs (tous) ──────────────────────────────────────────
  findManyUsers: (params: { skip: number; take: number; search?: string }) => {
    const where = params.search
      ? {
          OR: [
            { fullName: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
            { phone: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {};
    return prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
  },

  findUserById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { orders: true } },
      },
    }),

  updateUserRole: (id: string, role: "CUSTOMER" | "SELLER" | "ADMIN") =>
    prisma.user.update({ where: { id }, data: { role } }),
  deleteUser: (id: string) => prisma.user.delete({ where: { id } }),

  // ── Avis (modération) ────────────────────────────────────────────
  findManyReviews: (params: { skip: number; take: number; productId?: string }) => {
    const where = params.productId ? { productId: params.productId } : {};
    return prisma.$transaction([
      prisma.productReview.findMany({
        where,
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          product: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.productReview.count({ where }),
    ]);
  },

  findReviewById: (id: string) => prisma.productReview.findUnique({ where: { id } }),
  deleteReview: (id: string) => prisma.productReview.delete({ where: { id } }),

  findManyFeedback: (params: { skip: number; take: number; category?: FeedbackCategory }) => {
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
  },

  findFeedbackById: (id: string) => prisma.serviceFeedback.findUnique({ where: { id } }),
  updateFeedbackResponse: (id: string, teamResponse: string) =>
    prisma.serviceFeedback.update({ where: { id }, data: { teamResponse } }),
  deleteFeedback: (id: string) => prisma.serviceFeedback.delete({ where: { id } }),

  // ── Demandes de suppression de compte ────────────────────────────
  findManyDeletionRequests: (params: { skip: number; take: number; status?: DeletionRequestStatus }) => {
    const where = params.status ? { status: params.status } : {};
    return prisma.$transaction([
      prisma.accountDeletionRequest.findMany({
        where,
        include: { user: { select: { fullName: true, email: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
      }),
      prisma.accountDeletionRequest.count({ where }),
    ]);
  },

  findDeletionRequestById: (id: string) => prisma.accountDeletionRequest.findUnique({ where: { id } }),

  updateDeletionRequestStatus: (id: string, status: DeletionRequestStatus, adminNote?: string) =>
    prisma.accountDeletionRequest.update({
      where: { id },
      data: { status, adminNote, processedAt: new Date() },
    }),
};
