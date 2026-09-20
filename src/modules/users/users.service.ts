import { usersRepository } from "./users.repository";
import { authRepository } from "../auth/auth.repository";
import { toPublicUser } from "../auth/auth.mapper";
import { verifyPassword, hashPassword } from "../../utils/password";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../errors/AppError";
import type { ChangePasswordInput, UpdateProfileInput } from "./users.validators";

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
};
