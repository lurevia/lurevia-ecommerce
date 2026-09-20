import crypto from "node:crypto";
import ms from "./ms";
import { env } from "../config/env";

/**
 * Le refresh token n'est PAS un JWT : c'est une valeur opaque aléatoire.
 * Seul son hash SHA-256 est stocké en base (table refresh_tokens), afin
 * qu'une fuite de la base de données ne permette pas de rejouer un token.
 * La valeur en clair n'existe que le temps de la réponse HTTP (cookie
 * httpOnly), jamais persistée telle quelle.
 */
export const generateRefreshTokenValue = (): string => crypto.randomBytes(48).toString("hex");

export const hashToken = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

export const getRefreshTokenExpiry = (): Date =>
  new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRES_IN));
