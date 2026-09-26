import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(1).max(2000),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(1).max(2000).optional(),
});

export const productIdParamsSchema = z.object({
  productId: z.string().uuid("Identifiant de produit invalide"),
});

export const reviewIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant d'avis invalide"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
