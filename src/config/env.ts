import "dotenv/config";
import { z } from "zod";

/**
 * Schéma de validation des variables d'environnement.
 * Le serveur refuse de démarrer si une variable requise est manquante ou
 * invalide — on évite ainsi les surprises en production (ex: JWT secret vide).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default("/api/v1"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET doit faire au moins 32 caractères"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET doit faire au moins 32 caractères"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  CORS_ORIGINS: z.string().default("http://localhost:5173"),

  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  DEFAULT_SHIPPING_COST: z.coerce.number().int().nonnegative().default(8000),
  FREE_SHIPPING_THRESHOLD: z.coerce.number().int().nonnegative().default(250000),

  REVIEW_DELAY_DAYS: z.coerce.number().int().nonnegative().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // On log dans stderr et on arrête le process : une config invalide ne doit
  // jamais laisser le serveur démarrer dans un état partiellement fonctionnel.
  console.error("❌ Configuration d'environnement invalide :");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  isDevelopment: parsed.data.NODE_ENV === "development",
  isTest: parsed.data.NODE_ENV === "test",
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
};
