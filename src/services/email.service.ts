import { logger } from "../lib/logger";

export interface IEmailService {
  sendNewsletterConfirmation(params: { to: string; confirmationToken: string }): Promise<boolean>;
  sendEmail(options: { to: string; subject: string; html?: string; text?: string }): Promise<boolean>;
}

export class EmailService implements IEmailService {
  public async sendNewsletterConfirmation(params: { to: string; confirmationToken: string }): Promise<boolean> {
    logger.info(
      { to: params.to, confirmationToken: params.confirmationToken },
      "[EmailService] Envoi email confirmation newsletter"
    );
    return true;
  }

  public async sendEmail(options: { to: string; subject: string; html?: string; text?: string }): Promise<boolean> {
    logger.info({ to: options.to, subject: options.subject }, "[EmailService] Envoi email");
    return true;
  }
}

export const emailService = new EmailService();
