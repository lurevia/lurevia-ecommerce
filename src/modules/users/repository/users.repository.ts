import { prisma } from "../../../lib/prisma";
import type { Prisma } from "@prisma/client";

export class UsersRepository {
    findById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    }

    update(id: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({ where: { id }, data });
    }

    createProfileChangeRequest(userId: string,
        data: Prisma.ProfileChangeRequestCreateWithoutUserInput) {
        return prisma.profileChangeRequest.create({
            data: { ...data, user: { connect: { id: userId } } },
        });
    }

    findPendingProfileChangeRequest(userId: string) {
        return prisma.profileChangeRequest.findFirst({
            where: { userId, status: "PENDING" },
            orderBy: { createdAt: "desc" },
        });
    }

    findPendingDeletionRequest(userId: string) {
        return prisma.accountDeletionRequest.findFirst({
            where: { userId, status: "PENDING" },
        });
    }

    createDeletionRequest(userId: string, reason?: string) {
        return prisma.accountDeletionRequest.create({
            data: { userId, reason },
        });
    }

    async applyProfileChange(userId: string,
        params: {
            avatarUrl?: string | null;
            profileChange?: {
                requestedFullName?: string;
                requestedEmail?: string;
                requestedPhone?: string;
            };
        }) {
        return prisma.$transaction(async (tx) => {
            if (params.avatarUrl !== undefined) {
                await tx.user.update({
                    where: { id: userId },
                    data: { avatarUrl: params.avatarUrl },
                });
            }

            let request = null;
            if (params.profileChange) {
                request = await tx.profileChangeRequest.create({
                    data: {
                        userId,
                        requestedFullName: params.profileChange.requestedFullName,
                        requestedEmail: params.profileChange.requestedEmail,
                        requestedPhone: params.profileChange.requestedPhone,
                    },
                });
            }

            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            return { user, request };
        });
    }
}

export const usersRepository = new UsersRepository();
