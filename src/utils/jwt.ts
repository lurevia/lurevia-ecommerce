import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "@prisma/client";

export interface AccessTokenPayload {
  sub: string; // userId
  role: Role;
}

/**
 * Le token d'accès est un JWT classique, vérifié en mémoire à chaque requête
 * (pas d'appel base de données) — il reste volontairement à durée de vie
 * courte (15 min par défaut) pour limiter la fenêtre d'exploitation en cas
 * de vol. Le renouvellement passe par le refresh token (voir tokens.ts).
 */
export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: "lurevia-api",
  } as jwt.SignOptions);

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: "lurevia-api" }) as AccessTokenPayload;
