import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";

export interface AuthenticatedUser {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const extractAccessToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  if (req.cookies?.accessToken) return req.cookies.accessToken as string;
  return null;
};

/** Exige un utilisateur authentifié ; rejette avec 401 sinon. */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractAccessToken(req);
  if (!token) {
    next(new UnauthorizedError("Authentification requise"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new UnauthorizedError("Session expirée ou invalide"));
  }
};

/** Attache l'utilisateur si un token valide est présent, sans jamais rejeter. */
export const attachUserIfPresent = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractAccessToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // Token invalide/expiré en mode optionnel : on continue anonymement.
  }
  next();
};

/** Doit être utilisé après `requireAuth`. */
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
