import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { authRepository } from "./auth.repository";
import { issueTokenPair } from "./auth.service";
import { toPublicUser } from "./auth.mapper";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { AuthProvider } from "@prisma/client";
import { UnauthorizedError } from "../../errors/AppError";
import { env } from "../../config/env";

interface OAuthProfile {
  providerUserId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  phone: string | null;
}

interface AuthResult {
  user: ReturnType<typeof toPublicUser>;
  tokens: Awaited<ReturnType<typeof issueTokenPair>>;
  needsProfileCompletion: boolean;
}
export class OAuthService {
  private readonly googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID || undefined);
  }

  public async verifyGoogleToken(token: string): Promise<OAuthProfile> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID || undefined,
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
        phone: null,
      };
    } catch (error) {
      logger.error({ error }, "Erreur de vérification du token Google");
      throw new UnauthorizedError("Token Google invalide.");
    }
  }

  public async verifyFacebookToken(token: string): Promise<OAuthProfile> {
    try {
      const response = await axios.get("https://graph.facebook.com/me", {
        params: {
          fields: "id,name,email,picture,phone",
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
        phone: data.phone ?? null,
      };
    } catch (error) {
      logger.error({ error }, "Erreur de vérification du token Facebook");
      throw new UnauthorizedError("Token Facebook invalide.");
    }
  }

  public async verifyProviderToken(
    provider: AuthProvider,
    token: string
  ): Promise<OAuthProfile> {
    switch (provider) {
      case "GOOGLE":
        return this.verifyGoogleToken(token);
      case "FACEBOOK":
        return this.verifyFacebookToken(token);
      default:
        throw new UnauthorizedError("Fournisseur OAuth non supporté.");
    }
  }

  /**
   * Inscription OU connexion via OAuth (Google/Facebook).
   *
   * Flux :
   *  1. Vérifie le token OAuth → profil (email + nom + avatar + tel)
   *  2. Compte OAuth existant → login direct
   *  3. Email existant → liaison de compte
   *  4. Sinon → création compte incomplet + needsProfileCompletion = true
   */
  public async authenticateWithOAuth(
    provider: AuthProvider,
    token: string,
    createdByIp?: string
  ): Promise<AuthResult> {
    const profile = await this.verifyProviderToken(provider, token);

    const oauthAccount = await authRepository.findOAuthAccount(
      provider,
      profile.providerUserId
    );

    if (oauthAccount) {
      const user = oauthAccount.user;
      await authRepository.touchLastLogin(user.id);
      const tokens = await issueTokenPair(user.id, user.role, createdByIp);

      logger.info(
        { userId: user.id, provider },
        "Connexion OAuth réussie"
      );

      return {
        user: toPublicUser(user),
        tokens,
        needsProfileCompletion: !user.passwordHash || !user.phone,
      };
    }

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

      if (!existingUser.phone && profile.phone) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { phone: profile.phone },
        });
      }

      await authRepository.touchLastLogin(existingUser.id);
      const tokens = await issueTokenPair(
        existingUser.id,
        existingUser.role,
        createdByIp
      );

      logger.info(
        { userId: existingUser.id, provider },
        "Compte OAuth lié à un compte existant"
      );

      return {
        user: toPublicUser(existingUser),
        tokens,
        needsProfileCompletion:
          !existingUser.passwordHash || !existingUser.phone,
      };
    }

    const newUser = await prisma.user.create({
      data: {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        isVerified: false,
        primaryProvider: provider,
        primaryIdentifier: "EMAIL",
        lastLoginAt: new Date(),
        oauthAccounts: {
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

    logger.info(
      { userId: newUser.id, provider },
      "Nouveau compte OAuth créé — profil à compléter"
    );

    const tokens = await issueTokenPair(newUser.id, newUser.role, createdByIp);

    return {
      user: toPublicUser(newUser),
      tokens,
      needsProfileCompletion: true,
    };
  }
}

export const oauthService = new OAuthService();