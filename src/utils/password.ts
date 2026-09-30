import bcrypt from "bcryptjs";

// 12 rounds : bon compromis sécurité/latence pour un serveur API en 2026.
const SALT_ROUNDS = 12;

export const hashPassword = async (plain: string): Promise<string> => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = async (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
