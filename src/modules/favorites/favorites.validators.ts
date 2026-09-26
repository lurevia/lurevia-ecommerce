import { z } from "zod";

export const favoriteParamsSchema = z.object({
  productId: z.string().uuid("Identifiant de produit invalide"),
});
