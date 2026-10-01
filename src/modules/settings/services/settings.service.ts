import { prisma } from "../../../lib/prisma";
import type { PlatformSettings } from "@prisma/client";
import { logger } from "../../../lib/logger";
import type { UpdateSettingsInput } from "../dto";
import { SINGLETON_ID, PUBLIC_FIELDS } from "../lib/constant/settings.constant";
import { type PublicSettings, type PublicFieldKey } from "../lib/type/settings.type";

// ─────────────────────────────────────────────────────────────────────────────
// CLASSE SERVICE (OOP - Encapsulation de l'état du cache)
// ─────────────────────────────────────────────────────────────────────────────

export class SettingsService {
    private cachedSettings: PlatformSettings | null = null;
    private cachedAt = 0;
    private readonly cacheTtlMs: number;

    constructor(cacheTtlMs = 60_000) {
        this.cacheTtlMs = cacheTtlMs;
    }

    public invalidateCache(): void {
        this.cachedSettings = null;
        this.cachedAt = 0;
    }

    /**
     * Récupère les paramètres (avec cache interne à l'instance).
     * Ne crée JAMAIS d'enregistrement — c'est le seed qui s'en charge.
     */
    public async getSettings(): Promise<PlatformSettings> {
        const now = Date.now();
        if (this.cachedSettings && now - this.cachedAt < this.cacheTtlMs) {
            return this.cachedSettings;
        }

        const settings = await prisma.platformSettings.findUnique({
            where: { id: SINGLETON_ID },
        });

        if (!settings) {
            throw new Error(
                "PlatformSettings singleton introuvable. Exécutez le seed (prisma db seed)."
            );
        }

        this.cachedSettings = settings;
        this.cachedAt = now;
        return settings;
    }

    /**
     * Version publique : ne renvoie que les champs utiles au client.
     */
    public async getPublicSettings(): Promise<PublicSettings> {
        const settings = await this.getSettings();
        const result = {} as PublicSettings;
        for (const key of PUBLIC_FIELDS) {
            (result as Record<PublicFieldKey, PlatformSettings[PublicFieldKey]>)[key] =
                settings[key];
        }
        return result;
    }

    /**
     * Met à jour les paramètres (merge partiel).
     * Invalide le cache et trace dans AuditLog.
     */
    public async updateSettings(
        data: UpdateSettingsInput,
        updatedBy?: string
    ): Promise<PlatformSettings> {
        await this.getSettings();

        const updated = await prisma.$transaction(async (tx) => {
            const result = await tx.platformSettings.update({
                where: { id: SINGLETON_ID },
                data: { ...data, updatedBy },
            });

            await tx.auditLog.create({
                data: {
                    actorUserId: updatedBy,
                    action: "SETTINGS_UPDATED",
                    entityType: "PlatformSettings",
                    entityId: SINGLETON_ID,
                    metadata: { fields: Object.keys(data) },
                },
            });

            return result;
        });

        this.invalidateCache();
        logger.info(
            { updatedBy, fields: Object.keys(data) },
            "Paramètres plateforme mis à jour"
        );

        return updated;
    }
}

export const settingsService = new SettingsService();

// Fonctions déléguées pour rétrocompatibilité :
export const getSettings = () => settingsService.getSettings();
export const getPublicSettings = () => settingsService.getPublicSettings();
export const updateSettings = (data: UpdateSettingsInput, updatedBy?: string) =>
    settingsService.updateSettings(data, updatedBy);
