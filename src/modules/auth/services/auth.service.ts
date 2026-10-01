import { authRepository, type AuthRepository } from "../repository/auth.repository";
import { verifyPassword } from "../../../utils/password";
import { hashToken } from "../../../utils/refreshToken";
import { ConflictError, UnauthorizedError } from "../../../errors/AppError";
import type { LoginInput } from "../dto";
import { logger } from "../../../lib/logger";
import { prisma } from "../../../lib/prisma";
import { authMapper } from "../mapper/auth.mapper";
import { issueTokenPair } from "../lib/helper/auth.helper";

export class AuthService {
    constructor(
        private readonly repository: AuthRepository
    ) { }

    async login(input: LoginInput, createdByIp?: string) {
        const user = await this.repository.findUserByEmailOrPhone(input.identifier);

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

        await this.repository.touchLastLogin(user.id);
        const tokens = await issueTokenPair(user.id, user.role, createdByIp);

        logger.info({ userId: user.id }, "Connexion locale réussie");

        return {
            user: authMapper.toOutput({ ...user, lastLoginAt: new Date() }),
            tokens,
        };
    }

    async refresh(rawRefreshToken: string, createdByIp?: string) {
        const tokenHash = hashToken(rawRefreshToken);
        const stored = await this.repository.findRefreshTokenByHash(tokenHash);

        if (!stored) {
            throw new UnauthorizedError(
                "Session invalide, veuillez vous reconnecter."
            );
        }

        if (stored.revokedAt) {
            await this.repository.revokeAllUserTokens(stored.userId);
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
        await this.repository.revokeRefreshToken(stored.id);

        return { user: authMapper.toOutput(stored.user), tokens };
    }

    async logout(rawRefreshToken?: string) {
        if (!rawRefreshToken) return;

        const stored = await this.repository.findRefreshTokenByHash(
            hashToken(rawRefreshToken)
        );

        if (stored && !stored.revokedAt) {
            await this.repository.revokeRefreshToken(stored.id);
        }
    }

    async getCurrentUser(userId: string) {
        const user = await this.repository.findUserById(userId);
        if (!user) throw new UnauthorizedError("Utilisateur introuvable.");
        return authMapper.toOutput(user);
    }

    async requestVerification(userId: string) {
        const user = await this.repository.findUserById(userId);
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
    }

    async getVerificationStatus(userId: string) {
        const user = await this.repository.findUserById(userId);
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
    }
}

export const authService = new AuthService(authRepository);
