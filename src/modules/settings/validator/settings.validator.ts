import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const urlOrEmpty = z
    .string()
    .trim()
    .url("URL invalide")
    .or(z.literal(""))
    .nullable()
    .optional();

const hexColor = z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale attendue (#RRGGBB)");

const phoneOrEmpty = z
    .string()
    .trim()
    .max(30)
    .nullable()
    .optional();

// ─────────────────────────────────────────────────────────────────────────────
// SCHÉMA DE MISE À JOUR
// ─────────────────────────────────────────────────────────────────────────────

export const updateSettingsSchema = z.object({
    // ─── Général ───
    siteName: z.string().trim().min(1).max(100).optional(),
    siteTagline: z.string().trim().max(200).optional(),
    siteDescription: z.string().trim().max(500).optional(),
    contactEmail: z.string().trim().email().or(z.literal("")).optional(),
    contactPhone: z.string().trim().max(30).optional(),
    contactAddress: z.string().trim().max(200).optional(),
    defaultCurrency: z.string().trim().length(3).optional(),

    // ─── Marque ───
    logoUrl: urlOrEmpty,
    faviconUrl: urlOrEmpty,
    primaryColor: hexColor.optional(),
    secondaryColor: hexColor.optional(),
    accentColor: hexColor.optional(),

    // ─── Réseaux sociaux ───
    facebookUrl: urlOrEmpty,
    instagramUrl: urlOrEmpty,
    tiktokUrl: urlOrEmpty,
    whatsappNumber: phoneOrEmpty,
    linkedinUrl: urlOrEmpty,

    // ─── Légal ───
    privacyPolicy: z.string().max(50_000).optional(),
    termsOfService: z.string().max(50_000).optional(),
    cookieMessage: z.string().max(500).optional(),
    legalCompanyName: z.string().trim().max(200).optional(),
    legalRegistrationNumber: z.string().trim().max(100).nullable().optional(),

    // ─── Livraison ───
    freeShippingThreshold: z.number().int().min(0).optional(),
    defaultShippingCost: z.number().int().min(0).optional(),
    homeDeliveryEnabled: z.boolean().optional(),
    pickupPointEnabled: z.boolean().optional(),

    // ─── Paiements ───
    enableMVola: z.boolean().optional(),
    enableCOD: z.boolean().optional(),
    enableCard: z.boolean().optional(),
    enableBankTransfer: z.boolean().optional(),
    mvolaMerchantNumber: phoneOrEmpty,
    codMaxAmount: z.number().int().min(0).nullable().optional(),

    // ─── KYC / CIN ───
    requireCinForSellers: z.boolean().optional(),
    requireCinForCOD: z.boolean().optional(),
    cinVerificationEnabled: z.boolean().optional(),
    allowMinorWithGuardian: z.boolean().optional(),
    minorAgeThreshold: z.number().int().min(16).max(25).optional(),

    // ─── Enchères ───
    auctionsEnabled: z.boolean().optional(),
    auctionMinIncrement: z.number().int().min(100).optional(),
    auctionAutoExtendMinutes: z.number().int().min(0).max(30).optional(),
    auctionDefaultDurationH: z.number().int().min(1).max(168).optional(),
    auctionChatEnabled: z.boolean().optional(),
    auctionChatModeration: z.boolean().optional(),

    // ─── Notifications ───
    notifyOnNewOrder: z.boolean().optional(),
    notifyOnNewReview: z.boolean().optional(),
    notifyOnLowStock: z.boolean().optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    sendOrderConfirmation: z.boolean().optional(),
    sendShippingNotification: z.boolean().optional(),

    // ─── SEO ───
    metaTitle: z.string().trim().max(100).nullable().optional(),
    metaDescription: z.string().trim().max(200).nullable().optional(),

    // ─── Maintenance ───
    maintenanceMode: z.boolean().optional(),
    maintenanceMessage: z.string().max(500).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
