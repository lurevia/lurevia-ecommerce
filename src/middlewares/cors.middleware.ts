import cors from "cors";
import { env } from "../config/env";

export const corsMiddleware = cors({
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
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Request-Id",
    "X-Requested-With",
  ],
  exposedHeaders: ["X-Request-Id", "RateLimit-Limit", "RateLimit-Remaining"],
  maxAge: 86400,
});
