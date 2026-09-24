import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { authRepository } from "./auth.repository";
import { authService } from "./auth.service";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { AuthProvider } from "@prisma/client";
import { UnauthorizedError } from "../../errors/AppError";
import { env } from "../../config/env";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface OAuthProfile {
  providerUserId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const oauthService = {
  /**
   * Vérifie un ID Token Google et retourne le profil utilisateur.
   */
  async verifyGoogleToken(token: string): Promise<OAuthProfile> {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.sub || !payload.email) {
        throw new Error("Profil Google incomplet");
      }

      return {
        providerUserId: payload.sub,
        email: payload.email,
        fullName: payload.name || "Utilisateur Google",
        avatarUrl: payload.picture || "",
      };
    } catch (error) {
      logger.error({ error }, "Erreur de vérification du token Google");
      throw new UnauthorizedError("Token Google invalide.");
    }
  },

  /**
   * Vérifie un Access Token Facebook via l'API Graph.
   */
  async verifyFacebookToken(token: string): Promise<OAuthProfile> {
    try {
      const response = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          fields: "id,name,email,picture",
          access_token: token,
        },
      });

      const data = response.data;
      if (!data.id || !data.email) {
        throw new Error("Profil Facebook incomplet (email requis)");
      }

      return {
        providerUserId: data.id,
        email: data.email,
        fullName: data.name,
        avatarUrl: data.picture?.data?.url || "",
      };
    } catch (error) {
      logger.error({ error }, "Erreur de vérification du token Facebook");
      throw new UnauthorizedError("Token Facebook invalide.");
    }
  },

  /**
   * Gère l'authentification OAuth : Vérification -> Liaison/Création -> Session.
   */
  async authenticateWithOAuth(provider: AuthProvider, token: string, createdByIp?: string) {
    let profile: OAuthProfile;

    if (provider === "GOOGLE") {
      profile = await this.verifyGoogleToken(token);
    } else if (provider === "FACEBOOK") {
      profile = await this.verifyFacebookToken(token);
    } else {
      throw new UnauthorizedError("Fournisseur OAuth non supporté.");
    }

    // 1. Chercher un compte OAuth existant
    const oauthAccount = await authRepository.findOAuthAccount(provider, profile.providerUserId);

    if (oauthAccount) {
      const user = oauthAccount.user;
      await authRepository.touchLastLogin(user.id);
      const tokens = await authService.issueTokenPair(user.id, user.role, createdByIp);
      return { user, tokens };
    }

    // 2. Chercher un utilisateur par email (Liaison de compte)
    const existingUser = await authRepository.findByEmail(profile.email);

    if (existingUser) {
      await authRepository.createOAuthAccount({
        provider,
        providerUserId: profile.providerUserId,
        providerEmail: profile.email,
        providerName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        user: { connect: { id: existingUser.id } },
      });

      await authRepository.touchLastLogin(existingUser.id);
      const tokens = await authService.issueTokenPair(existingUser.id, existingUser.role, createdByIp);
      return { user: existingUser, tokens };
    }

    // 3. Créer un nouvel utilisateur (Auto-vérifié car provenant d'un provider fiable)
    const newUser = await prisma.user.create({
      data: {
        fullName: profile.fullName,
        email: profile.email,
        phone: "NOT_PROVIDED", // Valeur par défaut car obligatoire dans le schéma
        isVerified: true,
        primaryProvider: "LOCAL",
        primaryIdentifier: "EMAIL",
        lastLoginAt: new Date(),
        oAuthAccounts: {
          create: {
            provider,
            providerUserId: profile.providerUserId,
            providerEmail: profile.email,
            providerName: profile.fullName,
            avatarUrl: profile.avatarUrl,
          },
        },
      },
    });

    const tokens = await authService.issueTokenPair(newUser.id, newUser.role, createdByIp);
    return { user: newUser, tokens };
  },
};
