import type { IdentityVerificationStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { ConflictError, NotFoundError } from "../../../errors/AppError";

export interface IdentityListQuery {
  status?: IdentityVerificationStatus;
  isGuardian?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const adminIdentityService = {
  async listRequests(query: IdentityListQuery) {
    const pagination = normalizePagination(query.page, query.limit);

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.isGuardian !== undefined
        ? { isGuardianVerification: query.isGuardian }
        : {}),
      ...(query.search
        ? {
            user: {
              OR: [
                {
                  fullName: {
                    contains: query.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  email: {
                    contains: query.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  cinNumber: {
                    contains: query.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  guardianCinNumber: {
                    contains: query.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          }
        : {}),
    };

    const [items, totalItems] = await prisma.$transaction([
      prisma.identityVerification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.identityVerification.count({ where }),
    ]);

    const mapped = items.map((item) => ({
      id: item.id,
      userId: item.userId,
      userName: item.user.fullName,
      userEmail: item.user.email,
      userPhone: item.user.phone,
      status: item.status,
      isGuardian: item.isGuardianVerification,
      documentType: item.documentType,
      documentNumber: item.documentNumber,
      cinNumber: item.cinNumber,
      guardianFullName: item.guardianFullName,
      guardianCinNumber: item.guardianCinNumber,
      guardianRelation: item.guardianRelation,
      guardianPhone: item.guardianPhone,
      submittedAt: item.submittedAt.toISOString(),
      reviewedAt: item.reviewedAt?.toISOString(),
      rejectionReason: item.rejectionReason,
    }));

    return buildPaginatedResult(mapped, totalItems, pagination);
  },

  async approveRequest(requestId: string, adminId: string) {
    const request = await prisma.identityVerification.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) throw new NotFoundError("Demande de vérification");
    if (request.status !== "PENDING") {
      throw new ConflictError("Cette demande a déjà été traitée.");
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.identityVerification.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      });

      if (request.isGuardianVerification) {
        await tx.user.update({
          where: { id: request.userId },
          data: {
            isVerified: true,
            isMinor: true,
            guardianCinVerifiedAt: new Date(),
          },
        });
      } else {
        await tx.user.update({
          where: { id: request.userId },
          data: {
            isVerified: true,
            cinVerifiedAt: new Date(),
            identityVerifiedAt: new Date(),
            identityVerificationStatus: "APPROVED",
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: request.userId,
          type: "IDENTITY_VERIFIED",
          title: "Identité vérifiée",
          message:
            "Votre identité a été validée. Toutes les fonctionnalités sont débloquées.",
          actionUrl: "/compte",
          referenceKey: `identity-approved:${requestId}`,
          read: false,
        },
      });

      return updated;
    });
  },

  async rejectRequest(requestId: string, adminId: string, reason: string) {
    const request = await prisma.identityVerification.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundError("Demande de vérification");
    if (request.status !== "PENDING") {
      throw new ConflictError("Cette demande a déjà été traitée.");
    }

    await prisma.$transaction([
      prisma.identityVerification.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: adminId,
          rejectionReason: reason,
        },
      }),
      prisma.user.update({
        where: { id: request.userId },
        data: { identityVerificationStatus: "REJECTED" },
      }),
      prisma.notification.create({
        data: {
          userId: request.userId,
          type: "IDENTITY_VERIFIED",
          title: "Vérification refusée",
          message: `Votre vérification a été refusée : ${reason}. Vous pouvez refaire une demande.`,
          actionUrl: "/compte",
          referenceKey: `identity-rejected:${requestId}`,
          read: false,
        },
      }),
    ]);
  },
};
