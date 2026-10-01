import { authRepository, type AuthRepository } from "../repository/auth.repository";
import { hashPassword, verifyPassword } from "../../../utils/password";
import { hashToken } from "../../../utils/refreshToken";
import { ConflictError, UnauthorizedError } from "../../../errors/AppError";
import type { LoginInput, RegisterInput } from "../dto";
import { logger } from "../../../lib/logger";
import { authMapper } from "../mapper/auth.mapper";
import { issueTokenPair } from "../lib/helper/auth.helper";

export class AuthService {
    constructor(
        private readonly repository: AuthRepository
    ) { }

    async register(input: RegisterInput, createdByIp?: string) {
        if (await this.repository.findByEmail(input.email)) {
            throw new ConflictError("Cette adresse email est déjà utilisée.");
        }
        if (await this.repository.findByPhone(input.phone)) {
            throw new ConflictError("Ce numéro de téléphone est déjà utilisé.");
        }

        const user = await this.repository.createUser({
            fullName: input.fullName,
            email: input.email,
            phone: input.phone,
            passwordHash: await hashPassword(input.password),
            primaryIdentifier: "EMAIL",
            primaryProvider: "LOCAL",
        });
        const tokens = await issueTokenPair(user.id, user.role, createdByIp);

        logger.info({ userId: user.id }, "Inscription par email réussie; vérification d'identité requise");
        return { user: authMapper.toOutput(user), tokens };
    }

    async login(input: LoginInput, createdByIp?: string) {
        const user = await this.repository.findByEmail(input.email);

        if (!user) {
            throw new UnauthorizedError("Identifiants ou mot de passe incorrect.");
        }

        if (!user.passwordHash) {
            throw new UnauthorizedError(
                "Ce compte n'a pas de mot de passe. Connectez-vous avec Facebook puis complétez votre compte."
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

}

export const authService = new AuthService(authRepository);
