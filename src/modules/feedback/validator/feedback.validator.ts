import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Critères détaillés (facultatif)
// ─────────────────────────────────────────────────────────────────────────────
const criteriaSchema = z
    .object({
        delivery: z.number().int().min(1).max(5).optional(),
        support: z.number().int().min(1).max(5).optional(),
        website: z.number().int().min(1).max(5).optional(),
        valueForMoney: z.number().int().min(1).max(5).optional(),
    })
    .strict()
    .optional();

// ─────────────────────────────────────────────────────────────────────────────
// Création
// ─────────────────────────────────────────────────────────────────────────────
export const createFeedbackSchema = z.object({
    overallRating: z.number().int().min(1).max(5),
    category: z.enum(["delivery", "payment", "support", "website", "other"]),
    comment: z.string().trim().min(1).max(2000),
    criteria: criteriaSchema,
    orderId: z.string().uuid("Identifiant de commande invalide").optional(),
    productId: z.string().uuid("Identifiant de produit invalide").optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Mise à jour
// ─────────────────────────────────────────────────────────────────────────────
export const updateFeedbackSchema = createFeedbackSchema.partial();

// ─────────────────────────────────────────────────────────────────────────────
// Params
// ─────────────────────────────────────────────────────────────────────────────
export const feedbackIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de feedback invalide"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────────────────────
export const listFeedbackQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>;
