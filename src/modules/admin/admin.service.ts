import { randomInt } from "crypto";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../errors/AppError";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "USED" | "EXPIRED";

const generateVerificationCode = (): string => {
  return randomInt(100000, 999999).toString();
};

export const adminVerificationService = {
  async listRequests(status: VerificationStatus = "PENDING") {
    return prisma.verificationRequest.findMany({
      where: { status },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
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

    if (!request) {
      throw new NotFoundError("Demande introuvable.");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestError("Cette demande a déjà été traitée.");
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        code,
        expiresAt,
        approvedAt: new Date(),
        approvedBy: adminId,
      },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
    });
  },

  async rejectRequest(requestId: string, reason?: string) {
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError("Demande introuvable.");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestError("Cette demande a déjà été traitée.");
    }

    return prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reason: reason ?? "Non spécifiée",
      },
    });
  },
};