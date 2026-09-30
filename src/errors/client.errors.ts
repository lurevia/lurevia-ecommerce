import { AppError } from "./base.error";

/** 🚫 400 - Requête mal formée */
export class BadRequestError extends AppError {
  constructor(message = "Requête invalide", details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

/** 📋 422 - Données invalides sémantiquement (ex: Zod validation) */
export class ValidationError extends AppError {
  constructor(details: unknown, message = "Données invalides") {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

/** 🔒 401 - Non authentifié */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentification requise") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/** ⛔ 403 - Non autorisé */
export class ForbiddenError extends AppError {
  constructor(message = "Accès refusé") {
    super(message, 403, "FORBIDDEN");
  }
}

/** 🔍 404 - Ressource introuvable */
export class NotFoundError extends AppError {
  constructor(resource = "Ressource") {
    super(`${resource} introuvable`, 404, "NOT_FOUND");
  }
}

/** ⚔️ 409 - Conflit ou doublon */
export class ConflictError extends AppError {
  constructor(message = "Conflit avec une ressource existante", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

/** 🐢 429 - Trop de requêtes */
export class TooManyRequestsError extends AppError {
  constructor(message = "Trop de requêtes, veuillez réessayer plus tard") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}
