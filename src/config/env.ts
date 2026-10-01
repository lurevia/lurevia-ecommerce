import "dotenv/config";
import { z } from "zod";

const booleanFromString = (defaultValue: boolean) =>
  z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? defaultValue : v === "true"));

const nullableString = () =>
  z
    .string()
    .nullish()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null));

const nullableUrl = () =>
  z
    .string()
    .nullish()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null));

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("production"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default("/api/v1"),
  APP_NAME: z.string().default("Lurevia"),
  APP_URL: z.string().url().default("https://lurevia-ecommerce.onrender.com"),
  FRONTEND_URL: z
    .string()
    .default(
      "http://localhost:5173,https://lurevia.github.io,https://lurevia.github.io/lurevia-admin"
    ),

  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/lurevia?schema=public"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET doit faire au moins 32 caractères")
    .default("lurevia_super_secret_jwt_access_token_key_min_32_chars"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET doit faire au moins 32 caractères")
    .default("lurevia_super_secret_jwt_refresh_token_key_min_32_chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  CORS_ORIGINS: z.string().default("*"),
  COOKIE_DOMAIN: z.string().default(""),
  COOKIE_SECURE: booleanFromString(false),

  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  ADMIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(600),
  CIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  DEFAULT_SHIPPING_COST: z.coerce.number().int().nonnegative().default(8000),
  FREE_SHIPPING_THRESHOLD: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(250000),
  REVIEW_DELAY_DAYS: z.coerce.number().int().nonnegative().default(5),

  AUCTION_ANTI_SNIPE_MINUTES: z.coerce.number().int().positive().default(2),
  AUCTION_DEFAULT_DURATION_HOURS: z.coerce
    .number()
    .int()
    .positive()
    .default(24),
  AUCTION_MIN_INCREMENT: z.coerce.number().int().positive().default(1000),

  GITHUB_MEDIA_TOKEN: nullableString(),
  GITHUB_MEDIA_OWNER: z.string().default("lurevia"),
  GITHUB_MEDIA_REPO: z.string().default("lurevia-media"),
  GITHUB_MEDIA_BRANCH: z.string().default("main"),
  GITHUB_MEDIA_PATH: z.string().default("media"),
  MEDIA_MAX_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(10 * 1024 * 1024),

  GOOGLE_MAPS_API_KEY: nullableString(),
  GOOGLE_CLIENT_ID: nullableString(),
  SERPAPI_API_KEY: nullableString(),
  MAPS_PROVIDER: z.enum(["openstreetmap", "google", "serpapi"]).default("openstreetmap"),

  MVOLA_MERCHANT_NUMBER: nullableString(),
  MVOLA_API_URL: nullableUrl(),
  MVOLA_API_KEY: nullableString(),
  MVOLA_API_SECRET: nullableString(),
  MVOLA_CALLBACK_URL: nullableUrl(),

  ORANGE_MONEY_MERCHANT_ID: nullableString(),
  ORANGE_MONEY_API_URL: nullableUrl(),
  ORANGE_MONEY_API_KEY: nullableString(),
  ORANGE_MONEY_API_SECRET: nullableString(),
  ORANGE_MONEY_CALLBACK_URL: nullableUrl(),

  AIRTEL_MONEY_MERCHANT_ID: nullableString(),
  AIRTEL_MONEY_API_URL: nullableUrl(),
  AIRTEL_MONEY_API_KEY: nullableString(),
  AIRTEL_MONEY_API_SECRET: nullableString(),
  AIRTEL_MONEY_CALLBACK_URL: nullableUrl(),
});

export class EnvironmentConfig {
  private static instance: EnvironmentConfig | null = null;
  public readonly values: z.infer<typeof envSchema>;
  public readonly isProduction: boolean;
  public readonly isDevelopment: boolean;
  public readonly isTest: boolean;
  public readonly corsOrigins: string[];

  private constructor() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.warn("⚠️ Configuration d'environnement partielle ou invalide, utilisation des valeurs par défaut :");
      console.warn(parsed.error.flatten().fieldErrors);
      this.values = envSchema.parse({});
    } else {
      this.values = parsed.data;
    }
    this.isProduction = this.values.NODE_ENV === "production";
    this.isDevelopment = this.values.NODE_ENV === "development";
    this.isTest = this.values.NODE_ENV === "test";
    this.corsOrigins = this.values.CORS_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }
}

const envConfig = EnvironmentConfig.getInstance();

export const env = {
  ...envConfig.values,
  isProduction: envConfig.isProduction,
  isDevelopment: envConfig.isDevelopment,
  isTest: envConfig.isTest,
  corsOrigins: envConfig.corsOrigins,
};

export type Env = typeof env;