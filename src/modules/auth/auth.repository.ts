import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const authRepository = {
  // ─── Recherche ─────────────────────────────────────────────────────
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findByPhone: (phone: string) =>
    prisma.user.findUnique({ where: { phone } }),

  findUserById: (id: string) =>
    prisma.user.findUnique({ where: { id } }),

  findUserByEmailOrPhone: (identifier: string) =>
    prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    }),

  createUser: (data: Prisma.UserCreateInput) =>
    prisma.user.create({ data }),

  touchLastLogin: (id: string) =>
    prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    }),

  storeRefreshToken: (data: Prisma.RefreshTokenCreateInput) =>
    prisma.refreshToken.create({ data }),

  findRefreshTokenByHash: (tokenHash: string) =>
    prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    }),

  revokeRefreshToken: (id: string, replacedBy?: string) =>
    prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedBy },
    }),

  revokeAllUserTokens: (userId: string) =>
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
};