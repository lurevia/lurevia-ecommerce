import { z } from "zod";

const urlOrEmpty = z
  .string()
  .trim()
  .url("URL invalide")
  .or(z.literal(""))
  .nullable()
  .optional();

export const updateSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(100).optional(),
  siteTagline: z.string().trim().max(200).optional(),
  siteDescription: z.string().trim().max(500).optional(),
  contactEmail: z.string().trim().email().or(z.literal("")).optional(),
  contactPhone: z.string().trim().max(30).optional(),
  contactAddress: z.string().trim().max(200).optional(),
  defaultCurrency: z.string().trim().length(3).optional(),

  logoUrl: urlOrEmpty,
  faviconUrl: urlOrEmpty,
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),

  // Réseaux
  facebookUrl: urlOrEmpty,
  instagramUrl: urlOrEmpty,
  tiktokUrl: urlOrEmpty,
  whatsappNumber: z.string().trim().max(30).optional(),
  linkedinUrl: urlOrEmpty,

  // Confidentialité
  privacyPolicy: z.string().max(50000).optional(),
  termsOfService: z.string().max(50000).optional(),
  cookieMessage: z.string().max(500).optional(),
  legalCompanyName: z.string().trim().max(200).optional(),
  legalRegistrationNumber: z.string().trim().max(100).nullable().optional(),

  // Livraison
  freeShippingThreshold: z.number().int().min(0).optional(),
  defaultShippingCost: z.number().int().min(0).optional(),

  // Paiements
  enableMVola: z.boolean().optional(),
  enableCOD: z.boolean().optional(),
  enableCard: z.boolean().optional(),
  enableBankTransfer: z.boolean().optional(),
  mvolaMerchantNumber: z.string().trim().max(30).nullable().optional(),
  codMaxAmount: z.number().int().min(0).nullable().optional(),

  notifyOnNewOrder: z.boolean().optional(),
  notifyOnNewReview: z.boolean().optional(),
  notifyOnLowStock: z.boolean().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  sendOrderConfirmation: z.boolean().optional(),
  sendShippingNotification: z.boolean().optional(),

  metaTitle: z.string().trim().max(100).nullable().optional(),
  metaDescription: z.string().trim().max(200).nullable().optional(),

  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(500).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;