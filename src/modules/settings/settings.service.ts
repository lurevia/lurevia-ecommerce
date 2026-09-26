import { prisma } from "../../lib/prisma";

const SINGLETON_ID = "singleton";

const PUBLIC_FIELDS = [
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
  "enableMVola",
  "enableCOD",
  "enableCard",
  "enableBankTransfer",
  "codMaxAmount",
  "metaTitle",
  "metaDescription",
  "maintenanceMode",
  "maintenanceMessage",
] as const;

/** Récupère (ou crée) les paramètres. */
export async function getSettings() {
  let settings = await prisma.platformSettings.findUnique({
    where: { id: SINGLETON_ID },
  });

  if (!settings) {
    settings = await prisma.platformSettings.create({
      data: { id: SINGLETON_ID },
    });
  }

  return settings;
}

/** Version publique : ne renvoie que les champs utiles au client. */
export async function getPublicSettings() {
  const settings = await getSettings();
  const result: Record<string, any> = {};
  for (const key of PUBLIC_FIELDS) {
    result[key] = (settings as any)[key];
  }
  return result;
}

/** Met à jour les paramètres (merge partiel). */
export async function updateSettings(
  data: Partial<any>,
  updatedBy?: string
) {
  await getSettings(); // garantit l'existence
  return prisma.platformSettings.update({
    where: { id: SINGLETON_ID },
    data: { ...data, updatedBy },
  });
}