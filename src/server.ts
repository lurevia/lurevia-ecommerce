import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";

const start = async (): Promise<void> => {
  await prisma.$connect();
  logger.info("Connexion à la base de données établie");

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API Lurevia démarrée sur le port ${env.PORT} (${env.NODE_ENV})`);
  });

  const keepAliveInterval = setInterval(async () => {
    try {
      await prisma.$executeRawUnsafe("SELECT 1;");
      logger.debug("[DB Keep-Alive] Base de données pingée avec succès.");
    } catch (error) {
      logger.warn({ err: error }, "[DB Keep-Alive] Impossible de joindre la base de données.");
    }
  }, 10 * 60 * 1000);

  const shutdown = async (signal: string) => {
    logger.info(`Signal ${signal} reçu, arrêt en cours...`);

    clearInterval(keepAliveInterval);

    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Arrêt propre terminé");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Arrêt forcé après timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
};

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Rejet de promesse non géré");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Exception non interceptée");
  process.exit(1);
});

start().catch((err) => {
  logger.error({ err }, "Échec du démarrage du serveur");
  process.exit(1);
});