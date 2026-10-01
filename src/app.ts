import express, { type Express, type RequestHandler } from "express";
import path from "node:path";
import fs from "node:fs";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import apiRouter from "./routes";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import { globalRateLimiter } from "./middlewares/rateLimit.middleware";

export class Application {
  private readonly app: Express;

  constructor() {
    this.app = express();
    this.configureSecurityMiddlewares();
    this.configureParsingAndLogging();
    this.configureStaticAndRootRoutes();
    this.configureApiRoutes();
    this.configureErrorHandlers();
  }

  public getExpressApp(): Express {
    return this.app;
  }

  private configureSecurityMiddlewares(): void {
    this.app.set("trust proxy", 1);
    this.app.disable("x-powered-by");

    this.app.use(
      helmet({
        contentSecurityPolicy: env.isProduction ? undefined : false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (
            !origin ||
            env.corsOrigins.includes("*") ||
            env.corsOrigins.includes(origin)
          ) {
            callback(null, true);
            return;
          }
          callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
        exposedHeaders: [
          "X-Request-Id",
          "RateLimit-Limit",
          "RateLimit-Remaining",
        ],
        maxAge: 86400,
      })
    );

    this.app.use(globalRateLimiter);
  }

  private configureParsingAndLogging(): void {
    const defaultJsonParser = express.json({ limit: "1mb" });
    const mediaJsonParser = express.json({ limit: "15mb" });
    const mediaUploadPath = `${env.API_PREFIX}/media/upload`;

    this.app.use((req, res, next) => {
      if (req.path === mediaUploadPath) {
        return mediaJsonParser(req, res, next);
      }
      return defaultJsonParser(req, res, next);
    });

    this.app.use(express.urlencoded({ extended: true, limit: "1mb" }));
    this.app.use(cookieParser());
    this.app.use(hpp() as unknown as RequestHandler);

    this.app.use(
      pinoHttp({
        logger,
        autoLogging: {
          ignore: (req) => req.url === `${env.API_PREFIX}/health`,
        },
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
          }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
      })
    );

    this.app.use(compression() as unknown as RequestHandler);
  }

  private configureStaticAndRootRoutes(): void {
    this.app.get("/", (_req, res) => {
      res.json({
        name: env.APP_NAME,
        version: "1.0.0",
        status: "running",
        endpoints: `${env.API_PREFIX}`,
        health: `${env.API_PREFIX}/health`,
        docs: "/openapi.yaml",
      });
    });

    this.app.get("/openapi.yaml", (_req, res) => {
      const yamlPath = path.resolve(process.cwd(), "openapi.yaml");
      if (fs.existsSync(yamlPath)) {
        res.setHeader("Content-Type", "text/yaml; charset=utf-8");
        res.sendFile(yamlPath);
        return;
      }
      res.status(404).json({ error: "openapi.yaml not found" });
    });

    this.app.get(["/docs", "/swagger"], (_req, res) => {
      res.redirect("/openapi.yaml");
    });
  }

  private configureApiRoutes(): void {
    this.app.use(env.API_PREFIX, apiRouter);
  }

  private configureErrorHandlers(): void {
    this.app.use(notFoundMiddleware);
    this.app.use(errorMiddleware);
  }
}

export const createApp = (): Express => new Application().getExpressApp();