import rateLimit, { type Options } from "express-rate-limit";
import type { Request } from "express";
import { env } from "../config/env";

/**
 * ✅ Clé de rate limit : par utilisateur si connecté, sinon par IP.
 * Empêche un utilisateur de contourner la limite avec un VPN.
 */
const userOrIpKey = (req: Request): string => {
  if (req.user?.id) return `user:${req.user.id}`;
  return `ip:${req.ip ?? "unknown"}`;
};

const baseOptions: Partial<Options> = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  standardHeaders: true,
  legacyHeaders: false,
};

/** Limite générale appliquée à toute l'API. */
export const globalRateLimiter = rateLimit({
  ...baseOptions,
  max: env.RATE_LIMIT_MAX,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Trop de requêtes, réessayez plus tard.",
    },
  },
});

/** Limite stricte sur login/register/refresh. */
export const authRateLimiter = rateLimit({
  ...baseOptions,
  max: env.AUTH_RATE_LIMIT_MAX,
  skipSuccessfulRequests: true,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Trop de tentatives. Veuillez réessayer plus tard.",
    },
  },
});

/** Limite pour les routes admin. */
export const adminRateLimiter = rateLimit({
  ...baseOptions,
  max: env.ADMIN_RATE_LIMIT_MAX,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Trop de requêtes admin, réessayez plus tard.",
    },
  },
});

/** ✅ Limite pour les demandes de vérification CIN (anti-spam). */
export const cinRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000, // 1 heure
  max: env.CIN_RATE_LIMIT_MAX,
  keyGenerator: userOrIpKey,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Trop de demandes de vérification. Réessayez dans une heure.",
    },
  },
});

/** ✅ Limite pour les enchères (anti-spam d'offres). */
export const bidRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 offres par minute max
  keyGenerator: userOrIpKey,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Trop d'offres en peu de temps. Ralentissez.",
    },
  },
});