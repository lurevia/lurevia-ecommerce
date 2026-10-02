import { z } from "zod";
import { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";
import { normalizeMalagasyPhone } from "@/utils/phone";
import { ADDRESS_LIMITS, REGIONS_BY_PROVINCE } from "../lib/constant";

export const labelSchema = z
    .string()
    .trim()
    .min(1)
    .max(ADDRESS_LIMITS.MAX_LABEL_LENGTH);

export const fullNameSchema = z
    .string()
    .trim()
    .min(2)
    .max(ADDRESS_LIMITS.MAX_FULL_NAME_LENGTH);

export const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .optional();

export const provinceSchema = z.nativeEnum(ProvinceMadagascar);
export const regionSchema = z.nativeEnum(RegionMadagascar);

export const citySchema = z
    .string()
    .trim()
    .min(1)
    .max(ADDRESS_LIMITS.MAX_CITY_LENGTH);

export const neighborhoodSchema = z
    .string()
    .trim()
    .max(ADDRESS_LIMITS.MAX_NEIGHBORHOOD_LENGTH)
    .optional();

export const addressLineSchema = z
    .string()
    .trim()
    .min(3)
    .max(ADDRESS_LIMITS.MAX_ADDRESS_LENGTH);

export const latitudeSchema = z.number().min(-90).max(90).optional();
export const longitudeSchema = z.number().min(-180).max(180).optional();
export const accuracyMetersSchema = z.number().positive().max(100_000).optional();

export const notesSchema = z
    .string()
    .trim()
    .max(ADDRESS_LIMITS.MAX_NOTES_LENGTH)
    .optional();

export const isDefaultSchema = z.boolean().default(false);
export const pickupPointIdSchema = z.string().uuid().optional();

export const phoneSchema = z
    .string()
    .trim()
    .transform((value, ctx) => {
        const normalized = normalizeMalagasyPhone(value);
        if (!normalized) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Numéro invalide",
            });
            return z.NEVER;
        }
        return normalized;
    });

export const baseAddressSchema = z.object({
    label: labelSchema,
    fullName: fullNameSchema,
    phone: phoneSchema,
    email: emailSchema,
    province: provinceSchema,
    region: regionSchema,
    city: citySchema,
    neighborhood: neighborhoodSchema,
    address: addressLineSchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    accuracyMeters: accuracyMetersSchema,
    notes: notesSchema,
    isDefault: isDefaultSchema,
    pickupPointId: pickupPointIdSchema,
});

export const createAddressSchema = baseAddressSchema
    .refine(
        (data) => {
            const validRegions = REGIONS_BY_PROVINCE[data.province];
            return (validRegions as readonly string[]).includes(data.region);
        },
        {
            message: "La région sélectionnée n'appartient pas à la province choisie.",
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

export const updateAddressSchema = baseAddressSchema.partial();

export const addressIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant d'adresse invalide"),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
