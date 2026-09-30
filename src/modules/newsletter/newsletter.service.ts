import crypto from "node:crypto";
import { newsletterRepository } from "./newsletter.repository";
import { NotFoundError } from "../../errors/AppError";
import { emailService } from "../../services/email.service";
import { logger } from "../../lib/logger";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const generateConfirmationToken = () => crypto.randomBytes(32).toString("hex");

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const newsletterService = {
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
    const existing = await newsletterRepository.findByEmail(email);

    // Déjà confirmé et actif → on ne fait rien (idempotent, pas de 409)
    if (existing?.confirmedAt && !existing.unsubscribedAt) {
      // On renvoie succès pour ne pas révéler si un email est inscrit
      return { message: "Vérifiez votre boîte mail pour confirmer." };
    }

    const confirmationToken = generateConfirmationToken();

    if (existing) {
      // Non confirmé OU désinscrit → on relance
      await newsletterRepository.resubscribe(existing.id, confirmationToken);
    } else {
      await newsletterRepository.create({
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
  },

  /**
   * Confirme l'inscription après clic sur le lien reçu par email.
   */
  async confirm(token: string) {
    const subscriber =
      await newsletterRepository.findByConfirmationToken(token);
    if (!subscriber) {
      throw new NotFoundError("Lien de confirmation");
    }
    if (subscriber.confirmedAt && !subscriber.unsubscribedAt) {
      // Déjà confirmé → idempotent
      return { confirmed: true };
    }
    await newsletterRepository.confirm(subscriber.id);
    logger.info(
      { subscriberId: subscriber.id },
      "Newsletter confirmée"
    );
    return { confirmed: true };
  },

  /**
   * Désinscription par email (lien dans le footer de chaque email).
   */
  async unsubscribe(email: string, reason?: string) {
    const subscriber = await newsletterRepository.findByEmail(email);
    if (!subscriber) {
      // On ne révèle pas si l'email existe
      return { unsubscribed: true };
    }
    if (subscriber.unsubscribedAt) {
      // Déjà désinscrit → idempotent
      return { unsubscribed: true };
    }
    await newsletterRepository.unsubscribe(email, reason);
    logger.info(
      { subscriberId: subscriber.id, reason },
      "Désinscription newsletter"
    );
    return { unsubscribed: true };
  },

  /**
   * Compteur public (optionnel) : nombre d'abonnés confirmés.
   */
  async countConfirmed() {
    return newsletterRepository.countConfirmed();
  },

  /**
   * Liste admin (paginated).
   */
  async list(page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);
    const [items, totalItems] = await newsletterRepository.findMany(
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );
    return buildPaginatedResult(items, totalItems, pagination);
  },
};