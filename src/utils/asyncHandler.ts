import type { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Enveloppe un handler async pour transmettre automatiquement toute
 * exception au middleware d'erreur global via `next(err)`.
 * Évite de répéter try/catch dans chaque controller.
 */
export const asyncHandler =
  (fn: AsyncRouteHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
