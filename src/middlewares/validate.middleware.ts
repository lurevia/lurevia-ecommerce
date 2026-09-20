import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../errors/AppError";

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Valide body/query/params avec des schémas Zod et remplace `req.<target>`
 * par la donnée parsée (avec valeurs par défaut et coercions appliquées).
 * Toute donnée entrante est considérée non fiable — c'est la source de
 * vérité de validation côté serveur, indépendamment de ce que fait le front.
 */
export const validate =
  ({ body, query, params }: ValidationTargets) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (body) {
        const result = body.safeParse(req.body);
        if (!result.success) throw new ValidationError(result.error.flatten());
        req.body = result.data;
      }
      if (query) {
        const result = query.safeParse(req.query);
        if (!result.success) throw new ValidationError(result.error.flatten());
        req.query = result.data as typeof req.query;
      }
      if (params) {
        const result = params.safeParse(req.params);
        if (!result.success) throw new ValidationError(result.error.flatten());
        req.params = result.data as typeof req.params;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
