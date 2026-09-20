import pino from "pino";
import { env } from "../config/env";

/**
 * Logger structuré (JSON en production, lisible en développement).
 * Ne jamais logger : mots de passe, tokens, secrets, numéros de carte.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.isDevelopment
    ? {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      }
    : undefined,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
      "*.card.number",
      "*.card.cvv",
    ],
    remove: true,
  },
});
