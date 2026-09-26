import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default("/api/v1"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET doit faire au moins 32 caractères"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET doit faire au moins 32 caractères"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:5174/lurevia-admin,https://lurevia.github.io,https://lurevia.github.io/lurevia-admin"),

  COOKIE_DOMAIN: z.string().default(""),

  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) =>
      v === undefined ? process.env.NODE_ENV === "production" : v === "true"
    ),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  ADMIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(600),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  DEFAULT_SHIPPING_COST: z.coerce.number().int().nonnegative().default(8000),
  FREE_SHIPPING_THRESHOLD: z.coerce.number().int().nonnegative().default(250000),
  REVIEW_DELAY_DAYS: z.coerce.number().int().nonnegative().default(5),

  // ── Email transactionnel ──
  // Render bloque le trafic SMTP sortant (ports 25/465/587) sur son offre
  // gratuite : https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports
  // On utilise donc l'API HTTP de Resend (port 443) comme transport
  // principal — voir src/services/email.service.ts. Le SMTP reste
  // supporté comme repli pour le développement local si RESEND_API_KEY
  // n'est pas défini (ex : Mailtrap, Gmail avec mot de passe d'application).
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email("SMTP_FROM doit être une adresse e-mail valide").optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),

  MEDIA_GITHUB_TOKEN: z.string().optional(),
  MEDIA_GITHUB_OWNER: z.string().optional(),
  MEDIA_GITHUB_REPOSITORY: z.string().optional(),
  MEDIA_GITHUB_BRANCH: z.string().default("main"),
  MEDIA_GITHUB_PATH: z.string().default("media"),
  MEDIA_MAX_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  GOOGLE_PHOTOS_ACCESS_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Configuration d'environnement invalide :");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  isDevelopment: parsed.data.NODE_ENV === "development",
  isTest: parsed.data.NODE_ENV === "test",
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean),
};