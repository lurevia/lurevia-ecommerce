// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
export const SINGLETON_ID = "singleton";

/**
 * Champs exposés publiquement (front, landing, footer).
 * Ne contient AUCUN secret ni info sensible.
 */
export const PUBLIC_FIELDS = [
  "siteName",
  "siteTagline",
  "siteDescription",
  "contactEmail",
  "contactPhone",
  "contactAddress",
  "defaultCurrency",
  "logoUrl",
  "faviconUrl",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "facebookUrl",
  "instagramUrl",
  "tiktokUrl",
  "whatsappNumber",
  "linkedinUrl",
  "privacyPolicy",
  "termsOfService",
  "cookieMessage",
  "legalCompanyName",
  "legalRegistrationNumber",
  "freeShippingThreshold",
  "defaultShippingCost",
  "homeDeliveryEnabled",
  "pickupPointEnabled",
  "enableMVola",
  "enableCOD",
  "enableCard",
  "enableBankTransfer",
  "codMaxAmount",
  "auctionsEnabled",
  "metaTitle",
  "metaDescription",
  "maintenanceMode",
  "maintenanceMessage",
] as const;
