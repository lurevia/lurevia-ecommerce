import { newsletterRepository, type NewsletterRepository } from "../repository/newsletter.repository";
import { NotFoundError } from "../../../errors/AppError";
import { emailService } from "../../../services/email.service";
import { logger } from "../../../lib/logger";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { generateConfirmationToken } from "../lib/helper/newsletter.helper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class NewsletterService {
    constructor(
        private readonly repository: NewsletterRepository
    ) { }

    /**
     * Inscription avec double opt-in (RGPD).
     *
     * 1. Si l'email n'existe pas → crée avec un token
     * 2. Si l'email existe et déjà confirmé → renvoie "déjà inscrit"
     * 3. Si l'email existe mais non confirmé → régénère un token
     * 4. Si l'email existe et désinscrit → régénère un token (réinscription)
     *
     * Dans TOUS les cas, un email de confirmation est envoyé.
     */
    async subscribe(email: string, createdByIp?: string) {
        const existing = await this.repository.findByEmail(email);

        // Déjà confirmé et actif → on ne fait rien (idempotent, pas de 409)
        if (existing?.confirmedAt && !existing.unsubscribedAt) {
            // On renvoie succès pour ne pas révéler si un email est inscrit
            return { message: "Vérifiez votre boîte mail pour confirmer." };
        }

        const confirmationToken = generateConfirmationToken();

        if (existing) {
            // Non confirmé OU désinscrit → on relance
            await this.repository.resubscribe(existing.id, confirmationToken);
        } else {
            await this.repository.create({
                email,
                confirmationToken,
                createdByIp,
            });
        }

        // Envoi de l'email de confirmation (best effort)
        try {
            await emailService.sendNewsletterConfirmation({
                to: email,
                confirmationToken,
            });
        } catch (err) {
            logger.warn(
                { err, email },
                "Impossible d'envoyer l'email de confirmation newsletter"
            );
        }

        return { message: "Vérifiez votre boîte mail pour confirmer." };
    }

    /**
     * Confirme l'inscription après clic sur le lien reçu par email.
     */
    async confirm(token: string) {
        const subscriber =
            await this.repository.findByConfirmationToken(token);
        if (!subscriber) {
            throw new NotFoundError("Lien de confirmation");
        }
        if (subscriber.confirmedAt && !subscriber.unsubscribedAt) {
            // Déjà confirmé → idempotent
            return { confirmed: true };
        }
        await this.repository.confirm(subscriber.id);
        logger.info(
            { subscriberId: subscriber.id },
            "Newsletter confirmée"
        );
        return { confirmed: true };
    }

    /**
     * Désinscription par email (lien dans le footer de chaque email).
     */
    async unsubscribe(email: string, reason?: string) {
        const subscriber = await this.repository.findByEmail(email);
        if (!subscriber) {
            // On ne révèle pas si l'email existe
            return { unsubscribed: true };
        }
        if (subscriber.unsubscribedAt) {
            // Déjà désinscrit → idempotent
            return { unsubscribed: true };
        }
        await this.repository.unsubscribe(email, reason);
        logger.info(
            { subscriberId: subscriber.id, reason },
            "Désinscription newsletter"
        );
        return { unsubscribed: true };
    }

    /**
     * Compteur public (optionnel) : nombre d'abonnés confirmés.
     */
    async countConfirmed() {
        return this.repository.countConfirmed();
    }

    /**
     * Liste admin (paginated).
     */
    async list(page?: number, limit?: number) {
        const pagination = normalizePagination(page, limit);
        const [items, totalItems] = await this.repository.findMany(
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );
        return buildPaginatedResult(items, totalItems, pagination);
    }
}

export const newsletterService = new NewsletterService(newsletterRepository);
