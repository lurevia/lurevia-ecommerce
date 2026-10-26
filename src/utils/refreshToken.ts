import crypto from "node:crypto";
import ms from "./ms";
import { env } from "../config/env";

export const generateRefreshTokenValue = (): string => crypto.randomBytes(48).toString("hex");

export const hashToken = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

export const getRefreshTokenExpiry = (): Date =>
  new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN));
