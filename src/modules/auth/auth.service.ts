import { authRepository } from "./auth.repository";
import { verifyPassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import {
  generateRefreshTokenValue,
  getRefreshTokenExpiry,
  hashToken,
} from "../../utils/refreshToken";
import { ConflictError, UnauthorizedError } from "../../errors/AppError";
import { toPublicUser } from "./auth.mapper";
import type { LoginInput } from "./auth.validators";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import type { Role } from "@prisma/client";


interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}


export const issueTokenPair = async (
  userId: string,
  role: Role,
  createdByIp?: string
): Promise<TokenPair> => {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshTokenValue = generateRefreshTokenValue();
  const refreshTokenExpiresAt = getRefreshTokenExpiry();

  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      OR: [
        { expiresAt: { lt: new Date() } },
        {
          revokedAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
  });

  await authRepository.storeRefreshToken({
    tokenHash: hashToken(refreshTokenValue),
    expiresAt: refreshTokenExpiresAt,
    createdByIp,
    user: { connect: { id: userId } },
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    refreshTokenExpiresAt,
  };
};


export const authService = {

  async login(input: LoginInput, createdByIp?: string) {
    const user = await authRepository.findUserByEmailOrPhone(input.identifier);

    if (!user) {
      throw new UnauthorizedError("Identifiants ou mot de passe incorrect.");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError(
        "Ce compte n'a pas de mot de passe. Connectez-vous avec Google ou Facebook."
      );
    }

    const validPassword = await verifyPassword(
      input.password,
      user.passwordHash
    );

    if (!validPassword) {
      throw new UnauthorizedError("Identifiants ou mot de passe incorrect.");
    }

    await authRepository.touchLastLogin(user.id);
    const tokens = await issueTokenPair(user.id, user.role, createdByIp);

    logger.info({ userId: user.id }, "Connexion locale réussie");

    return {
      user: toPublicUser({ ...user, lastLoginAt: new Date() }),
      tokens,
    };
  },

  async refresh(rawRefreshToken: string, createdByIp?: string) {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedError(
        "Session invalide, veuillez vous reconnecter."
      );
    }

    if (stored.revokedAt) {
      await authRepository.revokeAllUserTokens(stored.userId);
      logger.warn(
        { userId: stored.userId },
        "Réutilisation d'un refresh token révoqué — sessions invalidées"
      );
      throw new UnauthorizedError(
        "Session invalide, veuillez vous reconnecter."
      );
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedError(
        "Session expirée, veuillez vous reconnecter."
      );
    }

    const tokens = await issueTokenPair(
      stored.userId,
      stored.user.role,
      createdByIp
    );
    await authRepository.revokeRefreshToken(stored.id);

    return { user: toPublicUser(stored.user), tokens };
  },

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;

    const stored = await authRepository.findRefreshTokenByHash(
      hashToken(rawRefreshToken)
    );

    if (stored && !stored.revokedAt) {
      await authRepository.revokeRefreshToken(stored.id);
    }
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("Utilisateur introuvable.");
    return toPublicUser(user);
  },

  async requestVerification(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("Utilisateur introuvable.");
    if (user.isVerified) {
      throw new ConflictError("Votre compte est déjà vérifié.");
    }
    if (!user.phone) {
      throw new ConflictError(
        "Ajoutez votre numéro de téléphone avant de demander la validation."
      );
    }

    const pending = await prisma.verificationRequest.findFirst({
      where: { userId, status: "PENDING" },
    });

    if (pending) {
      return { alreadyPending: true, requestId: pending.id };
    }

    const request = await prisma.verificationRequest.create({
      data: { userId, status: "PENDING" },
    });

    await prisma.adminNotification.create({
      data: {
        type: "CIN_VERIFICATION_REQUEST",
        title: "Nouvelle demande de vérification",
        message: `${user.fullName} (${user.email}) demande la vérification.`,
        entityType: "VerificationRequest",
        entityId: request.id,
        actorUserId: userId,
      },
    });

    logger.info({ userId, requestId: request.id }, "Demande de vérification");
    return { alreadyPending: false, requestId: request.id };
  },

  async getVerificationStatus(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("Utilisateur introuvable.");

    const request = await prisma.verificationRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        reason: true,
      },
    });

    return {
      isVerified: user.isVerified,
      request: request
        ? {
            id: request.id,
            status: request.status,
            requestedAt: request.createdAt,
            expiresAt: request.expiresAt,
            reason: request.reason,
          }
        : null,
    };
  },
};