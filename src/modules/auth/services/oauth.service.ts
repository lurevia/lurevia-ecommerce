import axios from "axios";
import { authRepository } from "../repository/auth.repository";
import { logger } from "../../../lib/logger";
import { prisma } from "../../../lib/prisma";
import { AuthProvider } from "@prisma/client";
import { UnauthorizedError } from "../../../errors/AppError";
import { issueTokenPair } from "../lib/helper/auth.helper";
import { authMapper } from "../mapper/auth.mapper";
import { type OAuthProfile, type AuthResult } from "../lib/type/auth.type";

export class OAuthService {
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
                fullName: data.name || "Utilisateur Facebook",
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
        if (provider !== "FACEBOOK") {
            throw new UnauthorizedError("Seule la connexion Facebook est prise en charge.");
        }
        return this.verifyFacebookToken(token);
    }

    /**
     * Inscription ou connexion via Facebook.
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
                user: authMapper.toOutput(user),
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
                user: authMapper.toOutput(existingUser),
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
            user: authMapper.toOutput(newUser),
            tokens,
            needsProfileCompletion: true,
        };
    }
}

export const oauthService = new OAuthService();
