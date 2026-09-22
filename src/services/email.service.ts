import nodemailer from "nodemailer";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
});

export class EmailDeliveryError extends AppError {
  constructor(cause?: unknown) {
    super("Le code de vérification n'a pas pu être envoyé par e-mail. L'approbation n'a pas été enregistrée.", 502, "EMAIL_DELIVERY_FAILED", cause);
  }
}

export const emailService = {
  async sendVerificationCode(input: { to: string; fullName: string; code: string; expiresAt: Date }) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: input.to,
        subject: "Votre code de vérification Lurevia",
        text: `Bonjour ${input.fullName},\n\nVotre code de vérification Lurevia est : ${input.code}\nIl expire le ${input.expiresAt.toISOString()}.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
      });
    } catch (error) {
      throw new EmailDeliveryError(error);
    }
  },
};
