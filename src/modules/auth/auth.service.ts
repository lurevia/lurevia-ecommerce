import { authRepository } from "./auth.repository";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import {
  generateRefreshTokenValue,
  getRefreshTokenExpiry,
  hashToken,
} from "../../utils/refreshToken";
import { ConflictError, UnauthorizedError } from "../../errors/AppError";
import { toPublicUser } from "./auth.mapper";
import type { LoginInput, RegisterInput } from "./auth.validators";
import { logger } from "../../lib/logger";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES INTERNES
// ─────────────────────────────────────────────────────────────────────────────

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const issueTokenPair = async (
  userId: string,
  role: "CUSTOMER" | "ADMIN",
  createdByIp?: string
): Promise<TokenPair> => {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshTokenValue = generateRefreshTokenValue();
  const refreshTokenExpiresAt = getRefreshTokenExpiry();

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

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Inscription — email ET téléphone obligatoires.
   * Le téléphone sert pour la livraison et le paiement Mobile Money.
   */
  async register(input: RegisterInput, createdByIp?: string) {
    // Unicité email
    const existingEmail = await authRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError("Cet email est déjà utilisé.");
    }

    // Unicité téléphone
    const existingPhone = await authRepository.findByPhone(input.phone);
    if (existingPhone) {
      throw new ConflictError("Ce numéro est déjà utilisé.");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.createUser({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      primaryIdentifier: "EMAIL",
      lastLoginAt: new Date(),
    });

    const tokens = await issueTokenPair(user.id, user.role, createdByIp);
    logger.info({ userId: user.id }, "Nouvel utilisateur inscrit");

    return { user: toPublicUser(user), tokens };
  },

  /**
   * Connexion — par email uniquement.
   * Message générique pour éviter l'énumération de comptes.
   */
  async login(input: LoginInput, createdByIp?: string) {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedError("Email ou mot de passe incorrect.");
    }

    const validPassword = await verifyPassword(
      input.password,
      user.passwordHash
    );

    if (!validPassword) {
      throw new UnauthorizedError("Email ou mot de passe incorrect.");
    }

    await authRepository.touchLastLogin(user.id);
    const tokens = await issueTokenPair(user.id, user.role, createdByIp);

    return {
      user: toPublicUser({ ...user, lastLoginAt: new Date() }),
      tokens,
    };
  },

  /**
   * Rotation de refresh token avec détection de rejeu.
   * Si un token déjà révoqué est présenté à nouveau → révocation totale
   * de la famille (sécurité en cas de vol).
   */
  async refresh(rawRefreshToken: string, createdByIp?: string) {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedError(
        "Session invalide, veuillez vous reconnecter."
      );
    }

    // Détection de rejeu
    if (stored.revokedAt) {
      await authRepository.revokeAllUserTokens(stored.userId);
      logger.warn(
        { userId: stored.userId },
        "Réutilisation d'un refresh token révoqué détectée — sessions invalidées"
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

  /**
   * Déconnexion — révoque le refresh token courant.
   */
  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;

    const stored = await authRepository.findRefreshTokenByHash(
      hashToken(rawRefreshToken)
    );

    if (stored && !stored.revokedAt) {
      await authRepository.revokeRefreshToken(stored.id);
    }
  },

  /**
   * Récupère l'utilisateur connecté depuis son ID.
   */
  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError("Utilisateur introuvable.");
    }
    return toPublicUser(user);
  },
};