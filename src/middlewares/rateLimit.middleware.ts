import rateLimit, { type Options } from "express-rate-limit";
import type { Request } from "express";
import { env } from "../config/env";

const userOrIpKey = (req: Request): string => {
	if (req.user?.id) return `user:${req.user.id}`;
	return `ip:${req.ip ?? "unknown"}`;
};

const baseOptions: Partial<Options> = {
	windowMs: env.RATE_LIMIT_WINDOW_MS,
	standardHeaders: true,
	legacyHeaders: false,
};

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

export const cinRateLimiter = rateLimit({
	...baseOptions,
	windowMs: 60 * 60 * 1000,
	max: env.CIN_RATE_LIMIT_MAX,
	keyGenerator: userOrIpKey,
	message: {
		error: {
			code: "TOO_MANY_REQUESTS",
			message: "Trop de demandes de vérification. Réessayez dans une heure.",
		},
	},
});

export const bidRateLimiter = rateLimit({
	...baseOptions,
	windowMs: 60 * 1000,
	max: 10,
	keyGenerator: userOrIpKey,
	message: {
		error: {
			code: "TOO_MANY_REQUESTS",
			message: "Trop d'offres en peu de temps. Ralentissez.",
		},
	},
});