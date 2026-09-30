import { AppError } from "./base.error";

/** 💥 500 - Erreur interne inattendue */
export class InternalServerError extends AppError {
  constructor(message = "Erreur interne du serveur", details?: unknown) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
  }
}

/** 🔌 503 - Service tiers ou externe temporairement indisponible */
export class ServiceUnavailableError extends AppError {
  constructor(service = "Service", message?: string) {
    super(
      message ?? `${service} temporairement indisponible`,
      503,
      "SERVICE_UNAVAILABLE"
    );
  }
}
