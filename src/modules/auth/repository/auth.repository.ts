import { prisma } from "../../../lib/prisma";
import type { AuthProvider, Prisma } from "@prisma/client";

export class AuthRepository {
    findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    findByPhone(phone: string) {
        return prisma.user.findUnique({ where: { phone } });
    }

    findUserById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    }

    createUser(data: Prisma.UserCreateInput) {
        return prisma.user.create({ data });
    }

    touchLastLogin(id: string) {
        return prisma.user.update({
            where: { id },
            data: { lastLoginAt: new Date() },
        });
    }

    updateUserPassword(userId: string, passwordHash: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { passwordHash, passwordChangedAt: new Date() },
        });
    }

    storeRefreshToken(data: Prisma.RefreshTokenCreateInput) {
        return prisma.refreshToken.create({ data });
    }

    findRefreshTokenByHash(tokenHash: string) {
        return prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
    }

    revokeRefreshToken(id: string, replacedBy?: string) {
        return prisma.refreshToken.update({
            where: { id },
            data: {
                revokedAt: new Date(),
                replacedBy: replacedBy
                    ? { connect: { id: replacedBy } }
                    : undefined,
            },
        });
    }

    revokeAllUserTokens(userId: string) {
        return prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    findOAuthAccount(provider: AuthProvider, providerUserId: string) {
        return prisma.oAuthAccount.findUnique({
            where: {
                provider_providerUserId: { provider, providerUserId },
            },
            include: { user: true },
        });
    }

    createOAuthAccount(data: Prisma.OAuthAccountCreateInput) {
        return prisma.oAuthAccount.create({ data });
    }

    updateOAuthAccount(id: string, data: Prisma.OAuthAccountUpdateInput) {
        return prisma.oAuthAccount.update({
            where: { id },
            data,
        });
    }
}

export const authRepository = new AuthRepository();
