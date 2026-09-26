import type { DeletionRequestStatus, FeedbackCategory, OrderStatus, PaymentMethod } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { adminRepository } from "./admin.repository";
import { adminNotificationsService } from "./adminNotifications.service";
import { toOrderDto, ORDER_STATUS_FROM_API, PAYMENT_METHOD_FROM_API } from "../orders/orders.mapper";
import { buildPaginatedResult, normalizePagination } from "../../utils/pagination";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../errors/AppError";
import { hashPassword } from "../../utils/password";
import { productsRepository } from "../products/products.repository";
import type { CreateAdminInput } from "./admin.validators";
import type {
  ListDeletionRequestsQuery,
  ListOrdersQuery,
  ListReviewsQuery,
  ListUsersQuery,
  ProcessDeletionRequestInput,
} from "./admin.validators";

const DELETION_STATUS_TO_API: Record<DeletionRequestStatus, string> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};
const DELETION_STATUS_FROM_API: Record<string, DeletionRequestStatus> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

const toUserDto = (u: {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  age: number | null;
  gender: string | null;
  isVerified: boolean;
  isActive: boolean;
  _count: { orders: number };
}) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email ?? undefined,
  phone: u.phone ?? undefined,
  role: u.role,
  avatarUrl: u.avatarUrl ?? undefined,
  age: u.age ?? undefined,
  gender: u.gender ?? undefined,
  isVerified: u.isVerified,
  isActive: u.isActive,
  ordersCount: u._count.orders,
  createdAt: u.createdAt.toISOString(),
  lastLoginAt: u.lastLoginAt?.toISOString(),
});

const toReviewDto = (r: {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: { fullName: string; email: string | null; avatarUrl: string | null };
  product: { title: string };
}) => ({
  id: r.id,
  productId: r.productId,
  productTitle: r.product.title,
  userId: r.userId,
  userName: r.user.fullName,
  userEmail: r.user.email ?? undefined,
  userAvatar: r.user.avatarUrl ?? undefined,
  isApproved: r.isApproved,
  approvedAt: r.approvedAt?.toISOString(),
  rejectedAt: r.rejectedAt?.toISOString(),
  rejectionReason: r.rejectionReason ?? undefined,
  rating: r.rating,
  title: r.title ?? undefined,
  comment: r.comment,
  isVerifiedPurchase: r.isVerifiedPurchase,
  createdAt: r.createdAt.toISOString(),
});

const toDeletionRequestDto = (d: {
  id: string;
  userId: string;
  reason: string | null;
  status: DeletionRequestStatus;
  adminNote: string | null;
  createdAt: Date;
  processedAt: Date | null;
  user: { fullName: string; email: string | null; phone: string | null; avatarUrl?: string | null };
}) => ({
  id: d.id,
  userId: d.userId,
  userName: d.user.fullName,
  userEmail: d.user.email ?? undefined,
  userPhone: d.user.phone ?? undefined,
  userAvatarUrl: d.user.avatarUrl ?? undefined,
  reason: d.reason ?? undefined,
  status: DELETION_STATUS_TO_API[d.status],
  adminNote: d.adminNote ?? undefined,
  createdAt: d.createdAt.toISOString(),
  processedAt: d.processedAt?.toISOString(),
});

export const adminService = {
  async createAdmin(input: CreateAdminInput, actorUserId: string, requestMeta: { ipAddress?: string; userAgent?: string }) {
    const [emailTaken, phoneTaken] = await Promise.all([
      prisma.user.findUnique({ where: { email: input.email }, select: { id: true } }),
      prisma.user.findUnique({ where: { phone: input.phone }, select: { id: true } }),
    ]);
    if (emailTaken) throw new ConflictError("Cet email est déjà utilisé.");
    if (phoneTaken) throw new ConflictError("Ce numéro est déjà utilisé.");

    const passwordHash = await hashPassword(input.password);
    try {
      const user = await prisma.user.create({
        data: {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          passwordHash,
          role: "ADMIN",
          primaryIdentifier: "EMAIL",
          primaryProvider: "LOCAL",
          emailVerified: true,
          phoneVerified: true,
          isVerified: true,
          lastLoginAt: null,
        },
        select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true },
      });
      await prisma.auditLog.create({
        data: {
          actorUserId,
          action: "ADMIN_CREATED",
          entityType: "USER",
          entityId: user.id,
          metadata: { email: user.email, role: user.role },
          ipAddress: requestMeta.ipAddress,
          userAgent: requestMeta.userAgent,
        },
      });
      return user;
    } catch (error: any) {
      if (error?.code === "P2002") throw new ConflictError("Cet email ou ce numéro est déjà utilisé.");
      throw error;
    }
  },
  stats: () => adminRepository.stats(),

  async listOrders(query: ListOrdersQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [orders, totalItems] = await adminRepository.findManyOrders({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      status: query.status
        ? ORDER_STATUS_FROM_API[query.status] ?? query.status.toUpperCase() as OrderStatus
        : undefined,
      paymentMethod: query.paymentMethod
        ? PAYMENT_METHOD_FROM_API[query.paymentMethod as keyof typeof PAYMENT_METHOD_FROM_API] ?? query.paymentMethod.toUpperCase().replaceAll("-", "_") as PaymentMethod
        : undefined,
      search: query.search,
    });
    return buildPaginatedResult(orders.map(toOrderDto), totalItems, pagination);
  },

  async getOrder(id: string) {
    const order = await adminRepository.findOrderById(id);
    if (!order) throw new NotFoundError("Commande");
    return toOrderDto(order);
  },

  async listUsers(query: ListUsersQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [users, totalItems] = await adminRepository.findManyUsers({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      search: query.search,
      role: query.role,
      gender: query.gender,
      age: query.age,
    });
    return buildPaginatedResult(users.map(toUserDto), totalItems, pagination);
  },

  async getUser(id: string) {
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError("Utilisateur");
    return toUserDto(user);
  },

  async listSellers(query: import("./admin.validators").SellerListQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const where = {
      role: "SELLER" as const,
      ...(query.status === "active" ? { isActive: true, isVerified: true } : {}),
      ...(query.status === "pending" ? { isActive: true, isVerified: false } : {}),
      ...(query.status === "suspended" ? { isActive: false } : {}),
      ...(query.search ? { OR: [
        { fullName: { contains: query.search, mode: "insensitive" as const } },
        { email: { contains: query.search, mode: "insensitive" as const } },
        { phone: { contains: query.search, mode: "insensitive" as const } },
      ] } : {}),
    };
    const [users, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: { sellerContracts: { orderBy: { version: "desc" }, take: 1, select: { type: true, value: true } } },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.user.count({ where }),
    ]);
    const items = users.map((user) => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      commissionRate: user.sellerContracts[0]?.type === "PERCENTAGE" ? user.sellerContracts[0].value : null,
      status: !user.isActive ? "suspended" : user.isVerified ? "active" : "pending",
      createdAt: user.createdAt.toISOString(),
    }));
    return buildPaginatedResult(items, totalItems, pagination);
  },

  async updateUserRole(id: string, role: "CUSTOMER" | "SELLER" | "ADMIN") {
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError("Utilisateur");
    await adminRepository.updateUserRole(id, role);
    const updated = await adminRepository.findUserById(id);
    return toUserDto(updated!);
  },

  async removeUser(id: string, adminId: string) {
    if (id === adminId) throw new ForbiddenError("Un administrateur ne peut pas supprimer son propre compte.");
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError("Utilisateur");
    await adminRepository.deleteUser(id);
  },

  async listReviews(query: ListReviewsQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [reviews, totalItems] = await adminRepository.findManyReviews({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      productId: query.productId,
      search: query.search,
      status: query.status,
      rating: query.rating,
    });
    return buildPaginatedResult(reviews.map(toReviewDto), totalItems, pagination);
  },

  /** Modération : supprime un avis inapproprié (spam, propos injurieux...). */
  async removeReview(id: string) {
    const review = await adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError("Avis");
    await adminRepository.deleteReview(id);
    await productsRepository.refreshRatingCache(review.productId);
  },

  async approveReview(id: string, adminId: string) {
    const review = await adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError("Avis");
    if (review.rejectedAt) throw new ConflictError("Cet avis a déjà été rejeté.");
    const updated = await prisma.productReview.update({
      where: { id },
      data: { isApproved: true, approvedBy: adminId, approvedAt: new Date(), rejectedBy: null, rejectedAt: null, rejectionReason: null },
      include: { user: { select: { fullName: true, email: true, avatarUrl: true } }, product: { select: { title: true } } },
    });
    await productsRepository.refreshRatingCache(review.productId);
    return toReviewDto(updated);
  },

  async rejectReview(id: string, adminId: string, reason?: string) {
    const review = await adminRepository.findReviewById(id);
    if (!review) throw new NotFoundError("Avis");
    const updated = await prisma.productReview.update({
      where: { id },
      data: { isApproved: false, rejectedBy: adminId, rejectedAt: new Date(), rejectionReason: reason ?? null },
      include: { user: { select: { fullName: true, email: true, avatarUrl: true } }, product: { select: { title: true } } },
    });
    await productsRepository.refreshRatingCache(review.productId);
    return toReviewDto(updated);
  },

  async listFeedback(query: import("./admin.validators").ListFeedbackQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [items, totalItems] = await adminRepository.findManyFeedback({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      category: query.category as FeedbackCategory | undefined,
    });
    return buildPaginatedResult(
      items.map((item) => ({
        id: item.id,
        userId: item.userId,
        userName: item.user.fullName,
        userEmail: item.user.email ?? undefined,
        overallRating: item.overallRating,
        category: item.category,
        comment: item.comment,
        teamResponse: item.teamResponse ?? undefined,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      totalItems,
      pagination
    );
  },

  async respondToFeedback(id: string, teamResponse: string) {
    const feedback = await adminRepository.findFeedbackById(id);
    if (!feedback) throw new NotFoundError("Feedback");
    return adminRepository.updateFeedbackResponse(id, teamResponse);
  },

  async removeFeedback(id: string) {
    const feedback = await adminRepository.findFeedbackById(id);
    if (!feedback) throw new NotFoundError("Feedback");
    await adminRepository.deleteFeedback(id);
  },

  async listDeletionRequests(query: ListDeletionRequestsQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [requests, totalItems] = await adminRepository.findManyDeletionRequests({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      status: query.status ? DELETION_STATUS_FROM_API[query.status] : undefined,
      search: query.search,
    });
    return buildPaginatedResult(requests.map(toDeletionRequestDto), totalItems, pagination);
  },

  /**
   * Validation manuelle : approuve la demande. La suppression effective du
   * compte reste une action distincte et volontairement manuelle côté
   * équipe (le schéma protège l'historique de commandes d'un utilisateur
   * — `Order.userId` est en `onDelete: Restrict` — donc un compte avec des
   * commandes ne peut pas être supprimé en base sans traitement préalable
   * de son historique).
   */
  async approveDeletionRequest(id: string, input: ProcessDeletionRequestInput) {
    const request = await adminRepository.findDeletionRequestById(id);
    if (!request) throw new NotFoundError("Demande de suppression");
    if (request.status !== "PENDING") throw new ConflictError("Cette demande a déjà été traitée.");
    const updated = await adminRepository.updateDeletionRequestStatus(id, "APPROVED", input.adminNote);
    return toDeletionRequestDto({ ...updated, user: (await adminRepository.findUserById(request.userId))! });
  },

  async rejectDeletionRequest(id: string, input: ProcessDeletionRequestInput) {
    const request = await adminRepository.findDeletionRequestById(id);
    if (!request) throw new NotFoundError("Demande de suppression");
    if (request.status !== "PENDING") throw new ConflictError("Cette demande a déjà été traitée.");
    const updated = await adminRepository.updateDeletionRequestStatus(id, "REJECTED", input.adminNote);
    return toDeletionRequestDto({ ...updated, user: (await adminRepository.findUserById(request.userId))! });
  },

  // ── Flux de notifications admin ──────────────────────────────────
  listNotifications: (page?: number, limit?: number, unreadOnly?: boolean) =>
    adminNotificationsService.list(page, limit, unreadOnly),

  countUnreadNotifications: () => adminNotificationsService.countUnread(),
  markNotificationRead: (id: string) => adminNotificationsService.markRead(id),
  markAllNotificationsRead: () => adminNotificationsService.markAllRead(),
};

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "USED" | "EXPIRED";

export const adminVerificationService = {
  async listRequests(status?: VerificationStatus, search?: string) {
    return prisma.verificationRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search ? { user: { OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ] } } : {}),
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  },

  async approveRequest(requestId: string, adminId: string) {
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });
    if (!request) throw new NotFoundError("Demande introuvable.");
    if (request.status !== "PENDING") throw new BadRequestError("Cette demande a déjà été traitée.");

    return prisma.$transaction(async (tx) => {
      const current = await tx.verificationRequest.findUnique({ where: { id: requestId } });
      if (!current || current.status !== "PENDING") {
        throw new BadRequestError("Cette demande a déjà été traitée.");
      }
      const updated = await tx.verificationRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", codeHash: null, expiresAt: null, approvedAt: new Date(), approvedBy: adminId },
        include: { user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } } },
      });
      await tx.user.update({ where: { id: request.userId }, data: { isVerified: true } });
      await tx.notification.create({
        data: {
          userId: request.userId,
          type: "ACCOUNT_VERIFICATION",
          title: "Compte vérifié",
          message: "Votre compte a été vérifié avec succès. Toutes les fonctionnalités sont maintenant activées.",
          actionUrl: "/compte",
          referenceKey: `verification-approved:${requestId}`,
          read: false,
        },
      });

      return updated;
    });
  },

  async rejectRequest(requestId: string, reason?: string) {
    const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundError("Demande introuvable.");
    if (request.status !== "PENDING") throw new BadRequestError("Cette demande a déjà été traitée.");

    const [updated] = await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED", reason: reason ?? "Non spécifiée" },
      }),
      prisma.notification.create({
        data: {
          userId: request.userId,
          type: "ACCOUNT_VERIFICATION",
          title: "Demande de vérification refusée",
          message: reason
            ? `Votre demande n'a pas été acceptée : ${reason}. Vous pouvez refaire une demande.`
            : "Votre demande n'a pas été acceptée. Vous pouvez refaire une demande depuis votre espace personnel.",
          actionUrl: "/compte",
          referenceKey: `verification-rejected:${requestId}`,
          read: false,
        },
      }),
    ]);

    return updated;
  },
};
