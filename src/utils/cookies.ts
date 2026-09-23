import type { Response } from "express";
import { env } from "../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

// En production, la boutique (lurevia.github.io) et l'API vivent sur des
// domaines différents : c'est du cross-site. Un cookie `SameSite=Lax`
// n'est JAMAIS envoyé sur une requête fetch/XHR cross-site (seulement sur
// une navigation top-level), donc `/auth/refresh` recevait un cookie vide
// et la session ne se restaurait jamais au rechargement de la page — d'où
// la déconnexion systématique. `SameSite=None` corrige ça, mais exige
// `Secure=true` (HTTPS) : on aligne donc les deux sur `COOKIE_SECURE`.
const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: (env.COOKIE_SECURE ? "none" : "lax") as "none" | "lax",
  domain: env.isProduction ? env.COOKIE_DOMAIN : undefined,
  path: "/api/v1/auth",
};

export const setRefreshTokenCookie = (res: Response, token: string, expiresAt: Date): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, { ...cookieOptions, expires: expiresAt });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
};

export { REFRESH_COOKIE_NAME };
