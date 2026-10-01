import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/env";
import { UnauthorizedError } from "../../../errors/AppError";
import { logger } from "../../../lib/logger";
import type { OAuthProfile } from "../lib/type/auth.type";

export class GoogleOAuthService {
  private readonly client = new OAuth2Client();

  async verifyToken(token: string): Promise<OAuthProfile> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new UnauthorizedError("La connexion Google n'est pas configurée.");
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email || !payload.email_verified) {
        throw new Error("Profil Google incomplet ou email non vérifié.");
      }

      return {
        providerUserId: payload.sub,
        email: payload.email,
        fullName: payload.name || "Utilisateur Google",
        avatarUrl: payload.picture || "",
        phone: null,
        emailVerified: true,
      };
    } catch (error) {
      logger.error({ error }, "Erreur de vérification du token Google");
      throw new UnauthorizedError("Token Google invalide.");
    }
  }
}

export const googleOAuthService = new GoogleOAuthService();
