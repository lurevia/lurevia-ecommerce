import nodemailer from "nodemailer";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 587,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
});

export class EmailDeliveryError extends AppError {
  constructor(cause?: unknown) {
    super("Le code de vérification n'a pas pu être envoyé par e-mail. L'approbation n'a pas été enregistrée.", 502, "EMAIL_DELIVERY_FAILED", cause);
  }
}

export const emailService = {
  async sendVerificationCode(input: { to: string; fullName: string; code: string; expiresAt: Date; link?: string }) {
    try {
      const message = input.link
        ? `Bonjour ${input.fullName},\n\nVotre compte a été approuvé ! Cliquez sur le lien suivant pour vérifier votre compte :\n${input.link}\n\nCe lien expire le ${input.expiresAt.toISOString()}.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`
        : `Bonjour ${input.fullName},\n\nVotre code de vérification Lurevia est : ${input.code}\nIl expire le ${input.expiresAt.toISOString()}.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`;

      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: input.to,
        subject: "Votre vérification de compte Lurevia",
        text: message,
      });
    } catch (error) {
      throw new EmailDeliveryError(error);
    }
  },

  async sendPasswordResetEmail(input: { to: string; fullName: string; resetLink: string }) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: input.to,
        subject: "Réinitialisation de votre mot de passe Lurevia",
        text: `Bonjour ${input.fullName},\n\nNous avons reçu une demande de réinitialisation de mot de passe pour votre compte Lurevia.\n\nCliquez sur le lien suivant pour définir un nouveau mot de passe :\n${input.resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.`,
      });
    } catch (error) {
      throw new EmailDeliveryError(error);
    }
  },
};
