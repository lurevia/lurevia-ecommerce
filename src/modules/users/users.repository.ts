import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const usersRepository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  update: (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data }),
  createProfileChangeRequest: (userId: string, data: Prisma.ProfileChangeRequestCreateWithoutUserInput) =>
    prisma.profileChangeRequest.create({ data: { ...data, user: { connect: { id: userId } } } }),
  findPendingProfileChangeRequest: (userId: string) =>
    prisma.profileChangeRequest.findFirst({ where: { userId, status: "PENDING" }, orderBy: { createdAt: "desc" } }),

  findPendingDeletionRequest: (userId: string) =>
    prisma.accountDeletionRequest.findFirst({ where: { userId, status: "PENDING" } }),

  createDeletionRequest: (userId: string, reason?: string) =>
    prisma.accountDeletionRequest.create({ data: { userId, reason } }),
};
