import nodemailer from "nodemailer";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { logger } from "../lib/logger";

export class EmailDeliveryError extends AppError {
  constructor(cause?: unknown) {
    super(
      "L'e-mail n'a pas pu être envoyé.",
      502,
      "EMAIL_DELIVERY_FAILED",
      cause
    );
  }
}

type MailInput = { to: string; subject: string; text: string };

/**
 * Render bloque le trafic SORTANT sur les ports SMTP (25/465/587) pour les
 * services web de son offre gratuite — un `nodemailer` classique pointé
 * vers Gmail/Mailtrap/etc. échoue donc systématiquement en production avec
 * un timeout, silencieusement, ce qui cassait la vérification de compte.
 * (référence : changelog Render, "Free web services will no longer allow
 * outbound traffic to SMTP ports")
 *
 * Solution : envoyer les emails via l'API HTTP de Resend (port 443, jamais
 * bloqué) plutôt que par une connexion SMTP directe. RESEND_API_KEY est le
 * transport privilégié dès qu'il est configuré ; le SMTP classique reste
 * disponible en repli pour le développement local (ex : Mailtrap), où le
 * blocage de Render ne s'applique pas.
 */
const sendViaResend = async (input: MailInput): Promise<void> => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.SMTP_FROM ?? "Lurevia <onboarding@resend.dev>",
      to: [input.to],
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.error({ status: response.status, body }, "Échec d'envoi via Resend");
    throw new Error(`Resend a refusé l'envoi (HTTP ${response.status})`);
  }
};

const smtpTransporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    })
  : null;

const sendViaSmtp = async (input: MailInput): Promise<void> => {
  if (!smtpTransporter) {
    throw new Error(
      "Aucun transport email configuré : définissez RESEND_API_KEY (recommandé en production, notamment sur Render) ou SMTP_HOST (développement local uniquement)."
    );
  }
  await smtpTransporter.sendMail({ from: env.SMTP_FROM, to: input.to, subject: input.subject, text: input.text });
};

const send = (input: MailInput): Promise<void> =>
  env.RESEND_API_KEY ? sendViaResend(input) : sendViaSmtp(input);

export const emailService = {
  async sendPasswordResetEmail(input: { to: string; fullName: string; resetLink: string }) {
    try {
      await send({
        to: input.to,
        subject: "Réinitialisation de votre mot de passe Lurevia",
        text: `Bonjour ${input.fullName},\n\nNous avons reçu une demande de réinitialisation de mot de passe pour votre compte Lurevia.\n\nCliquez sur le lien suivant pour définir un nouveau mot de passe :\n${input.resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.`,
      });
    } catch (error) {
      throw new EmailDeliveryError(error);
    }
  },
};
