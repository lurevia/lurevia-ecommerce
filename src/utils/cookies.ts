import type { Response } from "express";
import { env } from "../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

export const setRefreshTokenCookie = (res: Response, token: string, expiresAt: Date): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    domain: env.isProduction ? env.COOKIE_DOMAIN : undefined,
    path: "/api/v1/auth",
    expires: expiresAt,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    domain: env.isProduction ? env.COOKIE_DOMAIN : undefined,
    path: "/api/v1/auth",
  });
};

export { REFRESH_COOKIE_NAME };
