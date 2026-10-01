import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";
import { setupAuctionSocket } from "./modules/auctions/socket/auctions.socket";
import { startAuctionCron } from "./modules/auctions/cron/auctions.cron";

const DB_KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;
const SHUTDOWN_FORCE_MS = 10_000;
const SHUTDOWN_CLOSE_CONNECTIONS_MS = 5_000;

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
  } catch (err) {
    logger.warn({ err }, "Database connection failed at startup");
  }

  const app = createApp();
  const server = app.listen(env.PORT, "0.0.0.0", () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, pid: process.pid },
      `Server running on port ${env.PORT}`
    );
  });

  const io = setupAuctionSocket(server);
  app.set("io", io);
  const stopAuctionCron = startAuctionCron();

  const keepAliveInterval = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      logger.warn({ err: error }, "DB keep-alive failed");
    }
  }, DB_KEEPALIVE_INTERVAL_MS);

  let isShuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info({ signal }, "Shutting down");

    clearInterval(keepAliveInterval);
    stopAuctionCron();
    io.close(() => {
      logger.info("WebSocket closed");
    });
    server.closeIdleConnections();

    server.close(async (err) => {
      if (err) logger.error({ err }, "HTTP server close error");

      try {
        await prisma.$disconnect();
        logger.info("Clean shutdown complete");
        process.exit(0);
      } catch (disconnectErr) {
        logger.error({ err: disconnectErr }, "Prisma disconnect error");
        process.exit(1);
      }
    });

    setTimeout(() => {
      server.closeAllConnections();
    }, SHUTDOWN_CLOSE_CONNECTIONS_MS).unref();

    setTimeout(() => {
      process.exit(1);
    }, SHUTDOWN_FORCE_MS).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGHUP", () => void shutdown("SIGHUP"));
};

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled rejection");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception");
  process.exit(1);
});

start().catch((err) => {
  logger.error({ err }, "Startup failed");
  process.exit(1);
});