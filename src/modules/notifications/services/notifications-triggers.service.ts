import type { Order } from "@prisma/client";
import { notificationsRepository, type NotificationsRepository } from "../repository/notifications.repository";
import { env } from "../../../config/env";
import { DAY_MS } from "../lib/constant/notifications.constant";
import { shortOrderRef } from "../lib/helper/notifications.helper";

export class NotificationTriggersService {
    constructor(
        private readonly repository: NotificationsRepository
    ) { }

    async generateReviewReminders(userId: string) {
        const [deliveredOrders, reviewed] = await Promise.all([
            this.repository.findDeliveredOrdersForUser(userId),
            this.repository.findReviewedProductIds(userId),
        ]);

        const reviewedProductIds = new Set(reviewed.map((r) => r.productId));
        const now = Date.now();

        for (const order of deliveredOrders) {
            const availableAt =
                order.createdAt.getTime() + env.REVIEW_DELAY_DAYS * DAY_MS;
            if (now < availableAt) continue;

            for (const item of order.items) {
                if (reviewedProductIds.has(item.productId)) continue;

                await this.repository.upsertByReferenceKey(
                    userId,
                    `review:${order.id}:${item.productId}`,
                    {
                        type: "REVIEW_PENDING",
                        title: "Partagez votre avis",
                        message: `Qu'avez-vous pensé de "${item.titleSnapshot}" ? Votre avis compte pour la communauté.`,
                        actionUrl: `/produit/${item.productId}`,
                        imageUrl: item.imageSnapshot,
                    }
                );
            }
        }
    }

    async notifyOrderShipped(order: Order) {
        await this.repository.upsertByReferenceKey(
            order.userId,
            `order:${order.id}:shipped`,
            {
                type: "ORDER_SHIPPED",
                title: "Commande expédiée",
                message: `Votre commande #${shortOrderRef(order)} a été expédiée.`,
                actionUrl: `/compte/commandes/${order.id}`,
            }
        );
    }

    async notifyOrderDelivered(order: Order) {
        await this.repository.upsertByReferenceKey(
            order.userId,
            `order:${order.id}:delivered`,
            {
                type: "ORDER_DELIVERED",
                title: "Commande livrée",
                message: `Votre commande #${shortOrderRef(order)} a été livrée. Bon shopping chez Lurevia !`,
                actionUrl: `/compte/commandes/${order.id}`,
            }
        );
    }

    async notifyAccountVerified(userId: string) {
        await this.repository.upsertByReferenceKey(
            userId,
            `account:verified`,
            {
                type: "ACCOUNT_VERIFICATION",
                title: "Compte vérifié",
                message:
                    "Votre compte a été vérifié avec succès. Toutes les fonctionnalités sont activées.",
                actionUrl: "/compte",
            }
        );
    }

    async notifyIdentityVerified(userId: string) {
        await this.repository.upsertByReferenceKey(
            userId,
            `identity:verified`,
            {
                type: "IDENTITY_VERIFIED",
                title: "Identité vérifiée",
                message:
                    "Votre identité a été validée. Vous pouvez désormais vendre et enchérir.",
                actionUrl: "/compte",
            }
        );
    }

    async notifyPromo(
        userId: string,
        title: string,
        message: string,
        actionUrl: string
    ) {
        await this.repository.upsertByReferenceKey(
            userId,
            `promo:${Date.now()}`,
            {
                type: "PROMO",
                title,
                message,
                actionUrl,
            }
        );
    }

    async notifyAuctionWon(userId: string, productId: string, amount: number) {
        await this.repository.upsertByReferenceKey(
            userId,
            `auction:won:${productId}`,
            {
                type: "AUCTION_WON",
                title: "Vous avez remporté l'enchère !",
                message: `Félicitations, vous avez remporté l'enchère pour ${amount} Ar.`,
                actionUrl: `/compte/encheres/${productId}`,
            }
        );
    }

    async notifyAuctionOutbid(userId: string, productId: string) {
        await this.repository.upsertByReferenceKey(
            userId,
            `auction:outbid:${productId}`,
            {
                type: "AUCTION_OUTBID",
                title: "Vous avez été surenchéri",
                message:
                    "Quelqu'un a proposé plus que vous. Revenez pour reprendre la tête !",
                actionUrl: `/encheres/${productId}`,
            }
        );
    }

    async notifyAuctionStarted(userId: string, productId: string, title: string) {
        await this.repository.upsertByReferenceKey(
            userId,
            `auction:started:${productId}`,
            {
                type: "AUCTION_STARTED",
                title: "Nouvelle enchère disponible",
                message: `L'enchère "${title}" vient de commencer. Participez maintenant !`,
                actionUrl: `/encheres/${productId}`,
            }
        );
    }

    async notifyAuctionEndingSoon(userId: string, productId: string) {
        await this.repository.upsertByReferenceKey(
            userId,
            `auction:ending:${productId}`,
            {
                type: "AUCTION_ENDING_SOON",
                title: "Enchère bientôt terminée",
                message:
                    "Il reste moins de 5 minutes. Faites votre dernière offre maintenant !",
                actionUrl: `/encheres/${productId}`,
            }
        );
    }

    async notifyAuctionLost(userId: string, productId: string) {
        await this.repository.upsertByReferenceKey(
            userId,
            `auction:lost:${productId}`,
            {
                type: "AUCTION_LOST",
                title: "Enchère terminée",
                message:
                    "L'enchère est terminée et vous n'avez pas remporté le lot. Découvrez d'autres enchères.",
                actionUrl: "/encheres",
            }
        );
    }
}

export const notificationTriggersService = new NotificationTriggersService(notificationsRepository);
