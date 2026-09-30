import { prisma } from "../../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../../errors/AppError";

export type VerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "USED"
  | "EXPIRED";

export const adminVerificationService = {
  async listRequests(status?: VerificationStatus, search?: string) {
    return prisma.verificationRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              user: {
                OR: [
                  {
                    fullName: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    email: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
          },
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
    if (request.status !== "PENDING") {
      throw new BadRequestError("Cette demande a déjà été traitée.");
    }

    return prisma.$transaction(async (tx) => {
      const current = await tx.verificationRequest.findUnique({
        where: { id: requestId },
      });
      if (!current || current.status !== "PENDING") {
        throw new BadRequestError("Cette demande a déjà été traitée.");
      }
      const updated = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          codeHash: null,
          expiresAt: null,
          approvedAt: new Date(),
          approvedBy: adminId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      });
      await tx.user.update({
        where: { id: request.userId },
        data: { isVerified: true },
      });
      await tx.notification.create({
        data: {
          userId: request.userId,
          type: "ACCOUNT_VERIFICATION",
          title: "Compte vérifié",
          message:
            "Votre compte a été vérifié avec succès. Toutes les fonctionnalités sont maintenant activées.",
          actionUrl: "/compte",
          referenceKey: `verification-approved:${requestId}`,
          read: false,
        },
      });

      return updated;
    });
  },

  async rejectRequest(requestId: string, reason?: string) {
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundError("Demande introuvable.");
    if (request.status !== "PENDING") {
      throw new BadRequestError("Cette demande a déjà été traitée.");
    }

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
