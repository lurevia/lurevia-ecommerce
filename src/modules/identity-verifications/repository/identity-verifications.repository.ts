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

    // ─── Création ───
    create(data: Prisma.IdentityVerificationCreateInput) {
        return prisma.identityVerification.create({ data });
    }

    // ─── Suppression (annulation avant traitement) ───
    delete(id: string) {
        return prisma.identityVerification.delete({ where: { id } });
    }
}

export const identityVerificationsRepository = new IdentityVerificationsRepository();
