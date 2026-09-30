import { z } from "zod";
import { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";
import { isWithinMadagascar } from "../../utils/geo";
import { normalizeMalagasyPhone } from "../../utils/phone";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

const provinceSchema = z.nativeEnum(ProvinceMadagascar);
const regionSchema = z.nativeEnum(RegionMadagascar);

// ─────────────────────────────────────────────────────────────────────────────
// CRÉATION / MISE À JOUR
// ─────────────────────────────────────────────────────────────────────────────

export const createPickupPointSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    provider: z.string().trim().min(2).max(80),
    phone: phoneSchema.optional(),
    email: z.string().trim().toLowerCase().email().max(200).optional(),

    province: provinceSchema,
    region: regionSchema,
    city: z.string().trim().min(1).max(100),
    address: z.string().trim().min(3).max(255),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    shippingZoneId: z.string().uuid().optional(),
    isActive: z.boolean().default(true),
  })
  .strict()
  .superRefine((data, ctx) => {
    // Latitude + longitude doivent être fournies ensemble
    const hasLat = data.latitude !== undefined;
    const hasLng = data.longitude !== undefined;
    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude et longitude doivent être fournies ensemble.",
        path: ["latitude"],
      });
    }
    // Coordonnées dans Madagascar
    if (data.latitude !== undefined && data.longitude !== undefined) {
      if (!isWithinMadagascar(data.latitude, data.longitude)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Les coordonnées sont hors de Madagascar.",
          path: ["latitude"],
        });
      }
    }
  });

export const updatePickupPointSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    provider: z.string().trim().min(2).max(80).optional(),
    phone: phoneSchema.optional(),
    email: z.string().trim().toLowerCase().email().max(200).optional(),

    province: provinceSchema.optional(),
    region: regionSchema.optional(),
    city: z.string().trim().min(1).max(100).optional(),
    address: z.string().trim().min(3).max(255).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    shippingZoneId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.latitude !== undefined &&
      data.longitude !== undefined &&
      !isWithinMadagascar(data.latitude, data.longitude)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les coordonnées sont hors de Madagascar.",
        path: ["latitude"],
      });
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
// PARAMS & QUERY
// ─────────────────────────────────────────────────────────────────────────────

export const pickupPointIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de point relais invalide"),
});

export const listPickupPointsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  province: provinceSchema.optional(),
  region: regionSchema.optional(),
  city: z.string().trim().max(100).optional(),
  search: z.string().trim().max(150).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CreatePickupPointInput = z.infer<typeof createPickupPointSchema>;
export type UpdatePickupPointInput = z.infer<typeof updatePickupPointSchema>;
export type ListPickupPointsQuery = z.infer<typeof listPickupPointsQuerySchema>;