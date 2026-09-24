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
      data: {
        revokedAt: new Date(),
        replacedBy: replacedBy ? { connect: { id: replacedBy } } : undefined
      },
    }),

  revokeAllUserTokens: (userId: string) =>
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),

  // ─── Password Reset ────────────────────────────────────────────────
  createPasswordResetToken: (data: Prisma.PasswordResetTokenCreateInput) =>
    prisma.passwordResetToken.create({ data }),

  findPasswordResetTokenByHash: (tokenHash: string) =>
    prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    }),

  markPasswordResetTokenUsed: (id: string) =>
    prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    }),

  updateUserPassword: (userId: string, passwordHash: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),

  // ─── OAuth ────────────────────────────────────────────────────────
  findOAuthAccount: (provider: Prisma.AuthProvider, providerUserId: string) =>
    prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: { provider, providerUserId },
      },
      include: { user: true },
    }),

  createOAuthAccount: (data: Prisma.OAuthAccountCreateInput) =>
    prisma.oAuthAccount.create({ data }),

  updateOAuthAccount: (id: string, data: Prisma.OAuthAccountUpdateInput) =>
    prisma.oAuthAccount.update({
      where: { id },
      data,
    }),
};