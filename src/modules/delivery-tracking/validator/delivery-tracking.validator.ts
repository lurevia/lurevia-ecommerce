import { z } from "zod";
import { isWithinMadagascar } from "../../../utils/geo";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const latSchema = z.number().min(-90).max(90);
const lngSchema = z.number().min(-180).max(180);

// ─────────────────────────────────────────────────────────────────────────────
// PING GPS
// ─────────────────────────────────────────────────────────────────────────────

export const pingSchema = z
    .object({
        latitude: latSchema,
        longitude: lngSchema,
        accuracy: z.number().positive().max(10_000).optional(),
        speed: z.number().nonnegative().max(200).optional(),
        heading: z.number().min(0).max(360).optional(),
    })
    .superRefine((data, ctx) => {
        if (!isWithinMadagascar(data.latitude, data.longitude)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Les coordonnées sont hors de Madagascar.",
                path: ["latitude"],
            });
        }
    });

// ─────────────────────────────────────────────────────────────────────────────
// PARAMS
// ─────────────────────────────────────────────────────────────────────────────

export const orderIdParamsSchema = z.object({
    orderId: z.string().uuid("Identifiant de commande invalide"),
});

// ─────────────────────────────────────────────────────────────────────────────
// QUERY
// ─────────────────────────────────────────────────────────────────────────────

export const historyQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(500).default(100),
});

export const listMyDeliveriesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PingInput = z.infer<typeof pingSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
export type ListMyDeliveriesQuery = z.infer<typeof listMyDeliveriesQuerySchema>;
