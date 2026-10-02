import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/jwt";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";
import { prisma } from "../lib/prisma";


export interface AuthenticatedUser {
  id: string;
  role: Role;
  isVerified: boolean;
  isPrimaryAdmin: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}


export const extractAccessToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  if (req.cookies?.accessToken) return req.cookies.accessToken as string;
  return null;
};

async function loadValidUser(
  userId: string,
  payload: AccessTokenPayload
): Promise<AuthenticatedUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isVerified: true,
      isPrimaryAdmin: true,
      isActive: true,
      deletedAt: true,
      passwordChangedAt: true,
    },
  });

  if (!user) return null;
  if (!user.isActive) return null;
  if (user.deletedAt) return null;

  if (
    user.passwordChangedAt &&
    (!payload.iat || payload.iat * 1000 < user.passwordChangedAt.getTime())
  ) {
    return null;
  }

  return {
    id: user.id,
    role: user.role,
    isVerified: user.isVerified,
    isPrimaryAdmin: user.isPrimaryAdmin,
  };
}

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

  let payload: AccessTokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    next(new UnauthorizedError("Session expirée ou invalide"));
    return;
  }

  try {
    const user = await loadValidUser(payload.sub, payload);
    if (!user) {
      next(new UnauthorizedError("Session expirée ou invalide"));
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

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
    const user = await loadValidUser(payload.sub, payload);
    if (user) req.user = user;
  } catch {
  }

  next();
};

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

export const requireVerified = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }
  if (!req.user.isVerified) {
    next(
      new ForbiddenError(
        "Votre compte doit être vérifié avant d'effectuer cette action."
      )
    );
    return;
  }
  next();
};

export const requireSelf =
  (paramName = "userId") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    const targetId = req.params[paramName] ?? req.body?.[paramName];
    const isSelf = req.user.id === targetId;
    const isAdmin = req.user.role === "ADMIN";
    if (!isSelf && !isAdmin) {
      next(new ForbiddenError("Vous ne pouvez accéder qu'à vos propres ressources."));
      return;
    }
    next();
  };

export const requirePrimaryAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }
  if (req.user.role !== "ADMIN" || !req.user.isPrimaryAdmin) {
    next(new ForbiddenError("Seul l’administrateur principal peut gérer les catégories."));
    return;
  }
  next();
};