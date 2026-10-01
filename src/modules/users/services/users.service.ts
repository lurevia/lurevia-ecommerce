import { usersRepository, type UsersRepository } from "../repository/users.repository";
import { authRepository } from "../../auth/repository/auth.repository";
import { verifyPassword, hashPassword } from "../../../utils/password";
import { adminNotificationsService } from "../../admin/services/admin-notifications.service";
import { logger } from "../../../lib/logger";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../../../errors/AppError";
import type { ChangePasswordInput, CompleteOAuthProfileInput, RequestDeletionInput, UpdateProfileInput } from "../dto";
import { authMapper } from "../../auth/mapper/auth.mapper";

export class UsersService {
    constructor(
        private readonly repository: UsersRepository
    ) { }

    async completeOAuthProfile(
        userId: string,
        input: CompleteOAuthProfileInput
    ) {
        const user = await this.repository.findById(userId);
        if (!user) throw new NotFoundError("Utilisateur");

        if (user.primaryProvider === "LOCAL") {
            throw new BadRequestError(
                "Cette route est réservée aux comptes sociaux incomplets."
            );
        }
        const existingPhone = await authRepository.findByPhone(input.phone);
        if (existingPhone && existingPhone.id !== userId) {
            throw new ConflictError("Ce numéro est déjà utilisé.");
        }

        const updated = await this.repository.update(userId, {
            fullName: input.fullName ?? user.fullName,
            phone: input.phone,
            ...(input.password
                ? { passwordHash: await hashPassword(input.password) }
                : {}),
            // ✅ Ne PAS remettre isVerified à false si l'utilisateur était déjà vérifié.
            //    On le remet à false UNIQUEMENT si un nouveau téléphone est fourni
            //    (donc à vérifier).
            ...(input.phone !== user.phone ? { isVerified: false, phoneVerified: false } : {}),
        });

        logger.info({ userId }, "Profil OAuth complété");
        return authMapper.toOutput(updated);
    }

    /**
     * Met à jour le profil.
     * - `avatarUrl` : appliqué immédiatement
     * - `fullName`, `email`, `phone` : nécessitent une validation admin
     *   (création d'une ProfileChangeRequest)
     */
    async updateProfile(userId: string, input: UpdateProfileInput) {
        const user = await this.repository.findById(userId);
        if (!user) throw new NotFoundError("Utilisateur");

        const hasSensitiveChange =
            input.fullName !== undefined ||
            input.email !== undefined ||
            input.phone !== undefined;

        // ✅ Bloque si une demande est déjà en attente
        if (hasSensitiveChange) {
            const pending = await this.repository.findPendingProfileChangeRequest(userId);
            if (pending) {
                throw new ConflictError(
                    "Une demande de modification de profil est déjà en attente."
                );
            }
        }

        // ✅ Transaction unique : avatar + création request + reload
        const { user: updated, request } = await this.repository.applyProfileChange(
            userId,
            {
                avatarUrl: input.avatarUrl,
                ...(hasSensitiveChange && {
                    profileChange: {
                        requestedFullName: input.fullName,
                        requestedEmail: input.email,
                        requestedPhone: input.phone,
                    },
                }),
            }
        );

        // ✅ Notifie les admins si une demande a été créée
        if (request) {
            await adminNotificationsService.notify({
                type: "PROFILE_CHANGE_REQUEST",
                title: "Demande de modification de profil",
                message: `${user.fullName} demande une modification de ses informations personnelles.`,
                entityType: "profileChangeRequest",
                entityId: request.id,
                actorUserId: userId,
            });
        }

        return {
            user: authMapper.toOutput(updated!),
            pendingChange: request
                ? { id: request.id, status: "PENDING" as const }
                : null,
        };
    }

    /**
     * Change le mot de passe.
     * - Vérifie le mot de passe actuel
     * - Interdit la réutilisation du même mot de passe
     * - Révoque TOUTES les sessions actives (appareils volés, etc.)
     */
    async changePassword(userId: string, input: ChangePasswordInput) {
        const user = await authRepository.findUserById(userId);
        if (!user) throw new NotFoundError("Utilisateur");

        // ✅ Vérifie qu'un hash existe (un compte 100% OAuth n'en a pas)
        if (!user.passwordHash) {
            throw new BadRequestError(
                "Aucun mot de passe n'est défini sur ce compte. Utilisez la connexion sociale."
            );
        }

        const valid = await verifyPassword(
            input.currentPassword,
            user.passwordHash
        );
        if (!valid) {
            throw new UnauthorizedError("Mot de passe actuel incorrect.");
        }

        if (input.currentPassword === input.newPassword) {
            throw new BadRequestError(
                "Le nouveau mot de passe doit différer de l'ancien."
            );
        }

        const passwordHash = await hashPassword(input.newPassword);
        await this.repository.update(userId, {
            passwordHash,
            passwordChangedAt: new Date(),
        });

        // ✅ Révoque TOUTES les sessions actives
        await authRepository.revokeAllUserTokens(userId);

        logger.info({ userId }, "Mot de passe changé, sessions révoquées");
    }

    /**
     * Demande de suppression de compte (validation admin manuelle).
     */
    async requestDeletion(userId: string, input: RequestDeletionInput) {
        const user = await this.repository.findById(userId);
        if (!user) throw new NotFoundError("Utilisateur");

        const existing = await this.repository.findPendingDeletionRequest(userId);
        if (existing) {
            throw new ConflictError(
                "Une demande de suppression est déjà en attente de traitement."
            );
        }

        const request = await this.repository.createDeletionRequest(
            userId,
            input.reason
        );

        await adminNotificationsService.notify({
            type: "DELETION_REQUEST",
            title: "Demande de suppression de compte",
            message: `${user.fullName} souhaite supprimer son compte${input.reason ? ` — ${input.reason.slice(0, 80)}` : ""
                }`,
            entityType: "deletionRequest",
            entityId: request.id,
            actorUserId: userId,
        });

        logger.info({ userId, requestId: request.id }, "Demande de suppression");

        return {
            id: request.id,
            status: "pending" as const,
            createdAt: request.createdAt.toISOString(),
        };
    }
}

export const usersService = new UsersService(usersRepository);
