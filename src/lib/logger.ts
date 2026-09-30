import pino from "pino";
import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import { env } from "../config/env";

/**
 * 🎯 Logger structuré pour Lurevia.
 *
 * - JSON en production (exploitable par Datadog, Grafana...)
 * - Coloré et lisible en développement (pino-pretty)
 * - Caviardage automatique des données sensibles (mots de passe, tokens, CIN)
 *
 * ⚠️ Règle d'or : ne JAMAIS logger :
 *   - mots de passe, hashes de mots de passe
 *   - tokens JWT (access + refresh)
 *   - numéros CIN complets
 *   - numéros de carte bancaire / CVV
 *   - credentials mobile money
 */
export const logger = pino({
  level: env.LOG_LEVEL,

  // ─── Formatage ───
  transport: env.isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false, // Plus lisible pour les gros objets
        },
      }
    : undefined,

  // ─── Métadonnées globales ───
  base: {
    app: env.APP_NAME,
    env: env.NODE_ENV,
  },

  // ─── Horodatage ISO (meilleur pour le parsing) ───
  timestamp: pino.stdTimeFunctions.isoTime,

  // ─── Caviardage des données sensibles ───
  redact: {
    paths: [
      // Headers HTTP
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-api-key']",

      // Auth & identité
      "*.password",
      "*.passwordHash",
      "*.passwordChangedAt",
      "*.oldPassword",
      "*.newPassword",
      "*.confirmPassword",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
      "*.tokenHash",
      "*.codeHash",
      "*.verificationCode",

      // CIN & identité malgache
      "*.cinNumber",
      "*.guardianCinNumber",
      "*.identityDocumentNumber",

      // Paiement
      "*.card.number",
      "*.card.cvv",
      "*.card.expiry",
      "*.iban",
      "*.mobileMoneyPin",

      // Mobile money credentials
      "*.mvolaApiSecret",
      "*.orangeApiSecret",
      "*.airtelApiSecret",

      // OAuth secrets
      "*.clientSecret",
      "*.appSecret",

      // Clés API
      "*.apiKey",
      "*.githubToken",
    ],
    remove: true,
    censor: "[REDACTED]", // Utilisé si remove: false
  },

  // ─── Sérialisation personnalisée des erreurs ───
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

// ─────────────────────────────────────────────────────────────────────────
// Helper : logger une erreur avec son contexte
// ─────────────────────────────────────────────────────────────────────────
export function logError(
  error: unknown,
  context: Record<string, unknown> = {}
): void {
  if (error instanceof Error) {
    logger.error(
      {
        err: error,
        ...context,
      },
      error.message
    );
  } else {
    logger.error({ err: error, ...context }, "Erreur inconnue");
  }
}

export const httpLoggerOptions = {
  logger,
  genReqId: (req: IncomingMessage) => req.headers["x-request-id"] || crypto.randomUUID(),
  customLogLevel: (res: ServerResponse, err?: Error) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
    return `${req.method} ${req.url} → ${res.statusCode}`;
  },
  customErrorMessage: (req: IncomingMessage, res: ServerResponse) => {
    return `${req.method} ${req.url} → ${res.statusCode}`;
  },
  serializers: {
    req: (req: IncomingMessage) => ({
      method: req.method,
      url: req.url,
    }),
    res: (res: ServerResponse) => ({
      statusCode: res.statusCode,
    }),
  },
};