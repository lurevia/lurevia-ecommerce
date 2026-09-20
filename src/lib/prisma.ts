import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

/**
 * Singleton du client Prisma.
 *
 * En développement, `tsx watch` recharge le module à chaque changement de
 * fichier : sans précaution, cela ouvrirait une nouvelle pool de connexions
 * PostgreSQL à chaque hot-reload jusqu'à épuisement des connexions
 * disponibles. On accroche donc l'instance sur `globalThis` pour la
 * réutiliser d'un rechargement à l'autre.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: env.isDevelopment ? ["warn", "error"] : ["error"],
  });

if (!env.isProduction) {
  global.__prisma__ = prisma;
}
