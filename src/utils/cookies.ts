import type { Response } from "express";
import { env } from "../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: (env.COOKIE_SECURE ? "none" : "lax") as "none" | "lax",
  partitioned: env.COOKIE_SECURE, 
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/api/v1/auth",
};

export const setRefreshTokenCookie = (
  res: Response,
  token: string,
  expiresAt: Date
): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, { ...cookieOptions, expires: expiresAt });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
};

export { REFRESH_COOKIE_NAME };