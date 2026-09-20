import type { User } from "@prisma/client";

export type PublicUser = Omit<User, "passwordHash">;

/**
 * Ne renvoie jamais `passwordHash` au client — c'est la seule porte de
 * sortie des données utilisateur vers les réponses HTTP du module auth.
 */
export const toPublicUser = (user: User): PublicUser => {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
};
