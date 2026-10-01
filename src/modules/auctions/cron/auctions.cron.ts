import { auctionsRepository } from "../repository/auctions.repository";
import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";
import { notificationTriggersService } from "../../notifications/services/notifications-triggers.service";

const CLOSE_INTERVAL_MS = 30_000;


export async function closeExpiredAuctions() {
    try {
        const expired = await auctionsRepository.findExpiredAuctions();
        if (expired.length === 0) return;

        logger.info({ count: expired.length }, "Clôture d'enchères expirées");

        for (const product of expired) {
            const winningBid = product.bids[0];
            const currentPrice = product.auctionCurrentPrice ?? 0;
            const reservePrice = product.auctionReservePrice;

            const reserveMet =
                reservePrice === null || currentPrice >= reservePrice;

            if (winningBid && reserveMet) {
                // SOLD
                await auctionsRepository.closeAuction(product.id, {
                    status: "SOLD",
                    winnerId: winningBid.userId,
                    finalPrice: winningBid.proposedPrice,
                });

                await notificationTriggersService
                    .notifyAuctionWon(winningBid.userId, product.id, winningBid.proposedPrice)
                    .catch((err) =>
                        logger.error({ err, productId: product.id }, "Notif won failed")
                    );

                if (product.ownerId) {
                    await prisma.adminNotification.create({
                        data: {
                            type: "AUCTION_DISPUTE",
                            title: "Enchère terminée avec succès",
                            message: `"${product.title}" vendu à ${winningBid.proposedPrice} Ar.`,
                            entityType: "Product",
                            entityId: product.id,
                        },
                    });
                }

                logger.info(
                    { productId: product.id, winner: winningBid.userId, price: winningBid.proposedPrice },
                    "Enchère vendue"
                );
            } else {
                await auctionsRepository.closeAuction(product.id, {
                    status: "UNSOLD",
                });

                logger.info({ productId: product.id }, "Enchère non vendue (réserve non atteinte ou pas d'offre)");
            }
        }
    } catch (err) {
        logger.error({ err }, "Erreur clôture enchères");
    }
}

export function startAuctionCron() {
    const interval = setInterval(closeExpiredAuctions, CLOSE_INTERVAL_MS);
    interval.unref();
    logger.info("Cron enchères démarré (toutes les 30s)");
    return () => clearInterval(interval);
}
