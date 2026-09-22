import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";


declare global {
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: env.isDevelopment ? ["warn", "error"] : ["error"],
  });

if (!env.isProduction) {
  global.__prisma__ = prisma;
}
