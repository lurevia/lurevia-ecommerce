import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { env } from "../config/env";
import { logger } from "../lib/logger";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} introuvable` },
  } satisfies ErrorResponseBody);
};

/**
 * Middleware d'erreur centralisé — point unique de traduction des erreurs
 * internes (Prisma, Zod, JWT...) vers des réponses HTTP cohérentes, sans
 * jamais exposer de détails internes (stack trace, requêtes SQL, secrets)
 * en production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  // ── Erreurs métier connues ──
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, "Erreur serveur opérationnelle");
    }
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    } satisfies ErrorResponseBody);
    return;
  }

  // ── Erreurs de validation Zod non interceptées en amont ──
  if (err instanceof ZodError) {
    res.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "Données invalides", details: err.flatten() },
    } satisfies ErrorResponseBody);
    return;
  }

  // ── Erreurs Prisma connues (contraintes, enregistrement manquant...) ──
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "Une ressource avec ces informations existe déjà",
          details: env.isDevelopment ? err.meta : undefined,
        },
      } satisfies ErrorResponseBody);
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Ressource introuvable" } });
      return;
    }
    logger.error({ err, path: req.path }, "Erreur Prisma non gérée explicitement");
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Erreur interne du serveur" } });
    return;
  }

  // ── Tout le reste : bug non prévu. On ne révèle jamais la stack au client. ──
  logger.error({ err, path: req.path }, "Erreur non gérée");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Une erreur interne est survenue",
      details: env.isDevelopment && err instanceof Error ? err.stack : undefined,
    },
  } satisfies ErrorResponseBody);
};
