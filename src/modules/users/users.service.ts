import { usersRepository } from "./users.repository";
import { authRepository } from "../auth/auth.repository";
import { toPublicUser } from "../auth/auth.mapper";
import { verifyPassword, hashPassword } from "../../utils/password";
import { adminNotificationsService } from "../admin/adminNotifications.service";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../../errors/AppError";
import type { ChangePasswordInput, RequestDeletionInput, UpdateProfileInput } from "./users.validators";

export const usersService = {
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError("Utilisateur");

    const updated = await usersRepository.update(userId, {
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
    });
    return toPublicUser(updated);
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundError("Utilisateur");

    const valid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Mot de passe actuel incorrect.");

    if (input.currentPassword === input.newPassword) {
      throw new BadRequestError("Le nouveau mot de passe doit différer de l'ancien.");
    }

    const passwordHash = await hashPassword(input.newPassword);
    await usersRepository.update(userId, { passwordHash });
    // Révoque toutes les sessions actives : un changement de mot de passe
    // doit invalider les éventuels tokens déjà émis (ex: appareil volé).
    await authRepository.revokeAllUserTokens(userId);
  },

  /**
   * Un client ne peut pas supprimer son compte lui-même : la demande passe
   * par une validation manuelle admin (voir module admin), pour éviter les
   * suppressions accidentelles ou frauduleuses (ex: compte piraté).
   */
  async requestDeletion(userId: string, input: RequestDeletionInput) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError("Utilisateur");

    const existing = await usersRepository.findPendingDeletionRequest(userId);
    if (existing) throw new ConflictError("Une demande de suppression est déjà en attente de traitement.");

    const request = await usersRepository.createDeletionRequest(userId, input.reason);

    await adminNotificationsService.notify({
      type: "DELETION_REQUEST",
      title: "Demande de suppression de compte",
      message: `${user.fullName} souhaite supprimer son compte${input.reason ? ` — ${input.reason.slice(0, 80)}` : ""}`,
      entityType: "deletionRequest",
      entityId: request.id,
      actorUserId: userId,
    });

    return { id: request.id, status: "pending" as const, createdAt: request.createdAt.toISOString() };
  },
};
