import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../errors/AppError";
import { logger } from "../lib/logger";
import { env } from "../config/env";

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Valide body/query/params avec Zod.
 * Remplace `req.<target>` par la donnée parsée (defaults + coercions appliqués).
 * Toute donnée non déclarée dans le schéma est supprimée (anti mass-assignment).
 */
export const validate =
  ({ body, query, params }: ValidationTargets) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (body) {
        const result = body.safeParse(req.body);
        if (!result.success) {
          logValidationError("body", req.path, result.error.flatten());
          throw new ValidationError(result.error.flatten());
        }
        req.body = result.data;
      }

      if (query) {
        const result = query.safeParse(req.query);
        if (!result.success) {
          logValidationError("query", req.path, result.error.flatten());
          throw new ValidationError(result.error.flatten());
        }
        // ✅ Object.assign au lieu de réassigner (compat Express 5)
        Object.assign(req.query, result.data);
      }

      if (params) {
        const result = params.safeParse(req.params);
        if (!result.success) {
          logValidationError("params", req.path, result.error.flatten());
          throw new ValidationError(result.error.flatten());
        }
        Object.assign(req.params, result.data);
      }

      next();
    } catch (err) {
      next(err);
    }
  };

// ✅ Log uniquement en dev (pas de bruit en prod)
function logValidationError(
  target: string,
  path: string,
  details: unknown
): void {
  if (env.isDevelopment) {
    logger.debug({ target, path, details }, "Validation échouée");
  }
}