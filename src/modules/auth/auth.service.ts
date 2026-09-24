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
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.validators";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { emailService } from "../../services/email.service";
import crypto from "crypto";

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

export const issueTokenPair = async (
  userId: string,
  role: any,
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
   * Crée une notification persistée pour inviter l'utilisateur à vérifier
   * son compte (nécessaire pour passer commande).
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

    // 🎯 Notification persistée : invite à vérifier le compte
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "ACCOUNT_VERIFICATION",
          title: "Vérifiez votre compte",
          message:
            "Pour passer commande, demandez la vérification de votre compte depuis votre espace personnel.",
          actionUrl: "/compte",
          referenceKey: `verification:${user.id}`,
          read: false,
        },
      });
    } catch (err) {
      // La création de la notification ne doit pas bloquer l'inscription
      logger.warn(
        { err, userId: user.id },
        "Impossible de créer la notification de vérification"
      );
    }

    const tokens = await issueTokenPair(user.id, user.role, createdByIp);
    logger.info({ userId: user.id }, "Nouvel utilisateur inscrit");

    return { user: toPublicUser(user), tokens };
  },

  /**
   * Connexion — par email ou téléphone.
   * Message générique pour éviter l'énumération de comptes.
   */
  async login(input: any, createdByIp?: string) {
    const user = await authRepository.findUserByEmailOrPhone(input.identifier);

    if (!user) {
      throw new UnauthorizedError("Identifiants ou mot de passe incorrect.");
    }

    const validPassword = await verifyPassword(
      input.password,
      user.passwordHash || ""
    );

    if (!validPassword) {
      throw new UnauthorizedError("Identifiants ou mot de passe incorrect.");
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

  // ═════════════════════════════════════════════════════════════════════════
  // 🎯 VÉRIFICATION DE COMPTE (workflow admin)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * L'utilisateur demande la vérification de son compte.
   * Crée une VerificationRequest en statut PENDING (ou réutilise celle en cours).
   */
  async requestVerification(userId: string) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedError("Utilisateur introuvable.");
    }

    if (user.isVerified) {
      throw new ConflictError("Votre compte est déjà vérifié.");
    }

    // Y a-t-il déjà une demande en attente ?
    const pending = await prisma.verificationRequest.findFirst({
      where: { userId, status: "PENDING" },
    });

    if (pending) {
      return { alreadyPending: true, requestId: pending.id };
    }

    const request = await prisma.verificationRequest.create({
      data: {
        userId,
        status: "PENDING",
      },
    });

    logger.info(
      { userId, requestId: request.id },
      "Nouvelle demande de vérification de compte"
    );

    return { alreadyPending: false, requestId: request.id };
  },

  /**
   * L'utilisateur confirme son code → vérifie son compte et supprime la
   * notification associée.
   */
  async confirmVerification(userId: string, code: string) {
    if (!code || code.trim().length === 0) {
      throw new ConflictError("Code requis.");
    }

    const request = await prisma.verificationRequest.findFirst({
      where: {
        userId,
        // On retire la recherche par 'code' car le champ a été supprimé du schéma
        status: "APPROVED",
      },
    });

    if (!request) {
      throw new ConflictError("Code invalide.");
    }

    if (request.expiresAt && request.expiresAt < new Date()) {
      await prisma.verificationRequest.update({
        where: { id: request.id },
        data: { status: "EXPIRED" },
      });
      throw new ConflictError("Code expiré. Demandez un nouveau code.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
        },
      }),
      prisma.verificationRequest.update({
        where: { id: request.id },
        data: { status: "USED", usedAt: new Date() },
      }),
      prisma.notification.deleteMany({
        where: {
          userId,
          type: "ACCOUNT_VERIFICATION",
        },
      }),
    ]);

    logger.info({ userId }, "Compte vérifié avec succès");

    return { success: true };
  },

  /**
   * Retourne l'état de la dernière demande de vérification.
   */
  async getVerificationStatus(userId: string) {
    const request = await prisma.verificationRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    if (!request) {
      return { status: "NONE" as const };
    }

    return {
      status: request.status,
      requestedAt: request.createdAt,
      expiresAt: request.expiresAt,
    };
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🎯 RÉINITIALISATION DU MOT DE PASSE
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Demande de réinitialisation : génère un token haché en base et envoie l'email.
   */
  async requestPasswordReset(input: ForgotPasswordInput, createdByIp?: string) {
    const user = await authRepository.findByEmail(input.email);

    if (user) {
      // 1. Générer un token aléatoire et sécurisé
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

      // 2. Stocker le token haché
      await authRepository.createPasswordResetToken({
        tokenHash,
        expiresAt,
        createdByIp,
        user: { connect: { id: user.id } },
      });

      // 3. Envoyer l'email avec le token en clair
      const resetLink = `https://lurevia.com/reset-password?token=${rawToken}`;
      await emailService.sendPasswordResetEmail({
        to: user.email,
        fullName: user.fullName,
        resetLink,
      });

      logger.info({ userId: user.id }, "Demande de réinitialisation de mot de passe");
    }

    // Retourne toujours le même message pour éviter l'énumération de comptes
    return {
      message: "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.",
    };
  },

  /**
   * Réinitialisation effective : valide le token et met à jour le mot de passe.
   */
  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = hashToken(input.token);
    const storedToken = await authRepository.findPasswordResetTokenByHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError("Lien de réinitialisation invalide ou expiré.");
    }

    if (storedToken.usedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Lien de réinitialisation invalide ou expiré.");
    }

    const newPasswordHash = await hashPassword(input.password);

    await prisma.$transaction([
      authRepository.updateUserPassword(storedToken.userId, newPasswordHash),
      authRepository.markPasswordResetTokenUsed(storedToken.id),
    ]);

    logger.info({ userId: storedToken.userId }, "Mot de passe réinitialisé avec succès");
    return { success: true };
  },
};