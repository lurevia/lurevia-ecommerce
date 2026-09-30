import { z } from "zod";
import {
  ProvinceMadagascar,
  RegionMadagascar,
} from "@prisma/client";
import { normalizeMalagasyPhone } from "../../utils/phone";

const REGIONS_BY_PROVINCE: Record<ProvinceMadagascar, RegionMadagascar[]> = {
  ANTANANARIVO: ["ITASY", "ANALAMANGA", "VAKINANKARATRA", "BONGOLAVA"],
  ANTSIRANANA: ["DIANA", "SAVA"],
  MAHAJANGA: ["SOFIA", "BOENY", "BETSIBOKA", "MELAKY"],
  TOAMASINA: ["ALAOTRA_MANGORO", "ATSINANANA", "ANALANJIROFO", "AMBATOSOA"],
  FIANARANTSOA: [
    "AMORON_I_MANIA",
    "HAUTE_MATSIATRA",
    "VATOVAVY",
    "FITOVINANY",
    "ATSIMO_ATSINANANA",
    "IHOROMBE",
  ],
  TOLIARA: ["MENABE", "ATSIMO_ANDREFANA", "ANDROY", "ANOSY"],
};

const provinceSchema = z.nativeEnum(ProvinceMadagascar);
const regionSchema = z.nativeEnum(RegionMadagascar);

const phoneSchema = z
  .string()
  .trim()
  .transform((val, ctx) => {
    const normalized = normalizeMalagasyPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Numéro malgache invalide (ex : 034 12 345 67)",
      });
      return z.NEVER;
    }
    return normalized;
  });

const baseAddressSchema = z.object({
  label: z.string().trim().min(1).max(60),
  fullName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  email: z.string().trim().toLowerCase().email().optional(),
  province: provinceSchema,
  region: regionSchema,
  city: z.string().trim().min(1).max(100),
  neighborhood: z.string().trim().max(100).optional(),

  address: z.string().trim().min(3).max(255),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  notes: z.string().trim().max(500).optional(),

  isDefault: z.boolean().default(false),

  pickupPointId: z.string().uuid().optional(),
});

export const addressBodySchema = baseAddressSchema
  .refine(
    (data) => REGIONS_BY_PROVINCE[data.province].includes(data.region),
    {
      message:
        "La région sélectionnée n'appartient pas à la province choisie.",
      path: ["region"],
    }
  )
  .refine(
    (data) => {
      const hasLat = data.latitude !== undefined;
      const hasLng = data.longitude !== undefined;
      return hasLat === hasLng;
    },
    {
      message: "Latitude et longitude doivent être fournies ensemble.",
      path: ["latitude"],
    }
  );

export const updateAddressBodySchema = baseAddressSchema.partial();

export const addressIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant d'adresse invalide"),
});

export type AddressInput = z.infer<typeof addressBodySchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressBodySchema>;
