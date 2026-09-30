import { z } from "zod";

export const favoriteParamsSchema = z.object({
  productId: z.string().uuid("Identifiant de produit invalide"),
});

export const listFavoritesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ListFavoritesQuery = z.infer<typeof listFavoritesQuerySchema>;