import { prisma } from "../../../lib/prisma";
import type { Prisma, IdentityVerificationStatus } from "@prisma/client";

export class IdentityVerificationsRepository {
    // ─── Liste paginée (mes vérifications) ───
    findManyByUser(userId: string,
        skip: number,
        take: number,
        status?: IdentityVerificationStatus) {
        return prisma.$transaction([
            prisma.identityVerification.findMany({
                where: {
                    userId,
                    ...(status ? { status } : {}),
                },
                orderBy: { submittedAt: "desc" },
                skip,
                take,
            }),
            prisma.identityVerification.count({
                where: { userId, ...(status ? { status } : {}) },
            }),
        ]);
    }

    // ─── Détail ───
    findById(id: string) {
        return prisma.identityVerification.findUnique({ where: { id } });
    }

    // ─── Vérifie qu'une demande PENDING existe déjà ───
    findPendingForUser(userId: string) {
        return prisma.identityVerification.findFirst({
            where: { userId, status: "PENDING" },
            orderBy: { submittedAt: "desc" },
        });
    }

    findLatestForUser(userId: string) {
        return prisma.identityVerification.findFirst({
            where: { userId },
            orderBy: { submittedAt: "desc" },
        });
    }

    findPendingByCin(cinNumber: string, excludeUserId: string) {
        return prisma.identityVerification.findFirst({
            where: {
                status: "PENDING",
                userId: { not: excludeUserId },
                OR: [
                    { cinNumber },
                    { guardianCinNumber: cinNumber },
                ],
            },
            select: { id: true },
        });
    }

    // ─── Création ───
    create(data: Prisma.IdentityVerificationCreateInput) {
        return prisma.$transaction(async (tx) => {
            const verification = await tx.identityVerification.create({ data });
            await tx.user.update({
                where: { id: verification.userId },
                data: { identityVerificationStatus: "PENDING" },
            });
            return verification;
        });
    }

    // ─── Suppression (annulation avant traitement) ───
    delete(id: string) {
        return prisma.identityVerification.delete({ where: { id } });
    }
}

export const identityVerificationsRepository = new IdentityVerificationsRepository();
