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
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} introuvable`,
    },
  } satisfies ErrorResponseBody);
};

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, "Erreur serveur opérationnelle");
    }
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    } satisfies ErrorResponseBody);
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Données invalides",
        details: err.flatten(),
      },
    } satisfies ErrorResponseBody);
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Le corps de la requête n'est pas un JSON valide",
      },
    } satisfies ErrorResponseBody);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error({ err, path: req.path }, "Prisma validation error");
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Une erreur interne est survenue",
      },
    } satisfies ErrorResponseBody);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        res.status(409).json({
          error: {
            code: "CONFLICT",
            message: "Une ressource avec ces informations existe déjà",
            details: env.isDevelopment ? err.meta : undefined,
          },
        } satisfies ErrorResponseBody);
        return;

      case "P2025":
        res.status(404).json({
          error: { code: "NOT_FOUND", message: "Ressource introuvable" },
        } satisfies ErrorResponseBody);
        return;

      case "P2003":
        res.status(400).json({
          error: {
            code: "FOREIGN_KEY_ERROR",
            message: "Référence invalide vers une autre ressource",
          },
        } satisfies ErrorResponseBody);
        return;

      case "P2000":
        res.status(400).json({
          error: {
            code: "VALUE_TOO_LONG",
            message: "Une valeur est trop longue pour ce champ",
          },
        } satisfies ErrorResponseBody);
        return;

      default:
        logger.error({ err, path: req.path, code: err.code }, "Prisma error non gérée");
        res.status(500).json({
          error: { code: "INTERNAL_ERROR", message: "Erreur interne du serveur" },
        } satisfies ErrorResponseBody);
        return;
    }
  }

  logger.error({ err, path: req.path }, "Erreur non gérée");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Une erreur interne est survenue",
      details:
        env.isDevelopment && err instanceof Error ? err.stack : undefined,
    },
  } satisfies ErrorResponseBody);
};