import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/** Limite générale appliquée à toute l'API — protège contre les abus basiques. */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Trop de requêtes, réessayez plus tard." } },
});

/**
 * Limite stricte sur les routes sensibles à la sécurité (login, register,
 * refresh) — cible spécifiquement le brute-force et le credential stuffing
 * sans pénaliser la navigation normale sur le reste du catalogue.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Trop de tentatives. Veuillez réessayer plus tard.",
    },
  },
});

export const adminRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.ADMIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Trop de requêtes admin, réessayez plus tard." } },
});
