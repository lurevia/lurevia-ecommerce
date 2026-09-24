import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import apiRouter from "./routes";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware";
import { globalRateLimiter } from "./middlewares/rateLimit.middleware";
import { ForbiddenError } from "./errors/AppError";

export const createApp = (): Express => {
  const app = express();
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new ForbiddenError("Origine non autorisée par la politique CORS"));
      },
      credentials: true,
    })
  );

  app.use(compression());
  app.use(express.json({ limit: `${Math.ceil((env.MEDIA_MAX_BYTES * 4) / 3 / 1024 / 1024) + 1}mb` }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(hpp());

  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === `${env.API_PREFIX}/health` },
    })
  );

  app.use(globalRateLimiter);

  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
