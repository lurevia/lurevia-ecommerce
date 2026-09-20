import { z } from "zod";

export const favoriteParamsSchema = z.object({
  productId: z.string().cuid("Identifiant de produit invalide"),
});
