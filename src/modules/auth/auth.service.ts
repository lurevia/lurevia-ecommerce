import type { AuthIdentifier as PrismaAuthIdentifier } from "@prisma/client";
import { authRepository } from "./auth.repository";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import { generateRefreshTokenValue, getRefreshTokenExpiry, hashToken } from "../../utils/refreshToken";
import { ConflictError, UnauthorizedError } from "../../errors/AppError";
import { toPublicUser } from "./auth.mapper";
import type { LoginInput, RegisterInput } from "./auth.validators";
import { logger } from "../../lib/logger";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

const issueTokenPair = async (userId: string, role: "CUSTOMER" | "ADMIN", createdByIp?: string): Promise<TokenPair> => {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshTokenValue = generateRefreshTokenValue();
  const refreshTokenExpiresAt = getRefreshTokenExpiry();

  await authRepository.storeRefreshToken({
    tokenHash: hashToken(refreshTokenValue),
    expiresAt: refreshTokenExpiresAt,
    createdByIp,
    user: { connect: { id: userId } },
  });

  return { accessToken, refreshToken: refreshTokenValue, refreshTokenExpiresAt };
};

export const authService = {
  async register(input: RegisterInput, createdByIp?: string) {
    if (input.email) {
      const existing = await authRepository.findByEmail(input.email);
      if (existing) throw new ConflictError("Cet email est déjà utilisé.");
    }
    if (input.phone) {
      const existing = await authRepository.findByPhone(input.phone);
      if (existing) throw new ConflictError("Ce numéro est déjà utilisé.");
    }

    const passwordHash = await hashPassword(input.password);
    const primaryIdentifier: PrismaAuthIdentifier = input.primaryIdentifier === "email" ? "EMAIL" : "PHONE";

    const user = await authRepository.createUser({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      primaryIdentifier,
      lastLoginAt: new Date(),
    });

    const tokens = await issueTokenPair(user.id, user.role, createdByIp);
    logger.info({ userId: user.id }, "Nouvel utilisateur inscrit");

    return { user: toPublicUser(user), tokens };
  },

  async login(input: LoginInput, createdByIp?: string) {
    const identifier = input.identifier.trim().toLowerCase();
    const user = await authRepository.findUserByEmailOrPhone(identifier);

    // Message volontairement générique (évite l'énumération de comptes) :
    // on ne révèle pas si c'est l'identifiant ou le mot de passe qui est faux.
    if (!user) throw new UnauthorizedError("Identifiants incorrects.");

    const validPassword = await verifyPassword(input.password, user.passwordHash);
    if (!validPassword) throw new UnauthorizedError("Identifiants incorrects.");

    await authRepository.touchLastLogin(user.id);
    const tokens = await issueTokenPair(user.id, user.role, createdByIp);

    return { user: toPublicUser({ ...user, lastLoginAt: new Date() }), tokens };
  },

  async refresh(rawRefreshToken: string, createdByIp?: string) {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!stored) throw new UnauthorizedError("Session invalide, veuillez vous reconnecter.");

    // ── Détection de rejeu : un token déjà révoqué qui est présenté à nouveau
    // signale un vol potentiel (le token a fuité et un attaquant l'utilise
    // après l'utilisateur légitime, ou inversement). Par précaution, on
    // révoque immédiatement TOUTE la famille de tokens de l'utilisateur.
    if (stored.revokedAt) {
      await authRepository.revokeAllUserTokens(stored.userId);
      logger.warn({ userId: stored.userId }, "Réutilisation d'un refresh token révoqué détectée — sessions invalidées");
      throw new UnauthorizedError("Session invalide, veuillez vous reconnecter.");
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Session expirée, veuillez vous reconnecter.");
    }

    const tokens = await issueTokenPair(stored.userId, stored.user.role, createdByIp);
    await authRepository.revokeRefreshToken(stored.id);

    return { user: toPublicUser(stored.user), tokens };
  },

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    const stored = await authRepository.findRefreshTokenByHash(hashToken(rawRefreshToken));
    if (stored && !stored.revokedAt) {
      await authRepository.revokeRefreshToken(stored.id);
    }
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new UnauthorizedError("Utilisateur introuvable.");
    return toPublicUser(user);
  },
};
