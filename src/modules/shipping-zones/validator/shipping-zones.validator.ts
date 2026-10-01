import { z } from "zod";
import { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const regionSchema = z.nativeEnum(RegionMadagascar);
const provinceSchema = z.nativeEnum(ProvinceMadagascar);

// ─────────────────────────────────────────────────────────────────────────────
// CRÉATION / MISE À JOUR
// ─────────────────────────────────────────────────────────────────────────────

export const createShippingZoneSchema = z
    .object({
        name: z.string().trim().min(2).max(120),
        province: provinceSchema.optional(),
        regions: z.array(regionSchema).min(1, "Au moins une région est requise"),
        basePrice: z.number().int().min(0),
        pricePerKg: z.number().int().min(0).optional(),
        estimatedDays: z.number().int().min(1).max(30).optional(),
        isActive: z.boolean().default(true),
    })
    .strict();

export const updateShippingZoneSchema = createShippingZoneSchema.partial();

// ─────────────────────────────────────────────────────────────────────────────
// PARAMS & QUERY
// ─────────────────────────────────────────────────────────────────────────────

export const zoneIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de zone invalide"),
});

export const listZonesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
    province: provinceSchema.optional(),
    region: regionSchema.optional(),
    isActive: z.coerce.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CreateShippingZoneInput = z.infer<typeof createShippingZoneSchema>;
export type UpdateShippingZoneInput = z.infer<typeof updateShippingZoneSchema>;
export type ListZonesQuery = z.infer<typeof listZonesQuerySchema>;
