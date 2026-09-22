import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";
import { prisma } from "../lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  role: Role;
  isVerified: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const extractAccessToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  if (req.cookies?.accessToken) return req.cookies.accessToken as string;
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exige un utilisateur authentifié.
 * - 401 si pas de token ou token invalide
 * - Charge le user depuis la BDD pour garantir isVerified/role à jour
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractAccessToken(req);
  if (!token) {
    next(new UnauthorizedError("Authentification requise"));
    return;
  }

  let payload: { sub: string; role: Role };

  try {
    payload = verifyAccessToken(token);
  } catch {
    next(new UnauthorizedError("Session expirée ou invalide"));
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, isVerified: true },
    });

    if (!user) {
      next(new UnauthorizedError("Utilisateur introuvable"));
      return;
    }

    req.user = {
      id: user.id,
      role: user.role,
      isVerified: user.isVerified,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Attache l'utilisateur si un token valide est présent, sans jamais rejeter.
 * Utile pour les routes publiques qui veulent savoir si l'utilisateur est connecté.
 */
export const attachUserIfPresent = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractAccessToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, isVerified: true },
    });

    if (user) {
      req.user = {
        id: user.id,
        role: user.role,
        isVerified: user.isVerified,
      };
    }
  } catch {
    // Token invalide/expiré en mode optionnel : on continue anonymement.
  }

  next();
};

/**
 * Vérifie que l'utilisateur possède l'un des rôles requis.
 * ⚠️ Doit être utilisé APRÈS `requireAuth`.
 */
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError("Permissions insuffisantes pour cette action"));
      return;
    }
    next();
  };