import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Création
// ─────────────────────────────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(1).max(2000),
});

// ─────────────────────────────────────────────────────────────────────────────
// Mise à jour (partial)
// ─────────────────────────────────────────────────────────────────────────────
export const updateReviewSchema = createReviewSchema.partial();

// ─────────────────────────────────────────────────────────────────────────────
// Params
// ─────────────────────────────────────────────────────────────────────────────
export const productIdParamsSchema = z.object({
  productId: z.string().uuid("Identifiant de produit invalide"),
});

export const reviewIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant d'avis invalide"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────────────────────
export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;