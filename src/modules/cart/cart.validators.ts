import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().uuid("Identifiant de produit invalide"),
  quantity: z.number().int().positive().max(99).default(1),
});

export const updateCartItemBodySchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

export const cartItemParamsSchema = z.object({
  productId: z.string().uuid("Identifiant de produit invalide"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemBodySchema>;
