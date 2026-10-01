import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Ajouter un article
// ─────────────────────────────────────────────────────────────────────────────
export const addCartItemSchema = z.object({
    productId: z.string().uuid("Identifiant de produit invalide"),
    quantity: z.number().int().positive().max(99).default(1),
    colorId: z.string().uuid("Identifiant de couleur invalide").nullable().optional(),
    sizeId: z.string().uuid("Identifiant de taille invalide").nullable().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Mettre à jour la quantité d'un article
// ─────────────────────────────────────────────────────────────────────────────
export const updateCartItemBodySchema = z.object({
    quantity: z.number().int().min(0).max(99),
});

// ─────────────────────────────────────────────────────────────────────────────
// Params : productId + variantes (dans query pour lever l'ambiguïté)
// ─────────────────────────────────────────────────────────────────────────────
export const cartItemParamsSchema = z.object({
    productId: z.string().uuid("Identifiant de produit invalide"),
});

export const cartItemQuerySchema = z.object({
    colorId: z.string().uuid().optional(),
    sizeId: z.string().uuid().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemBodySchema>;
export type CartItemQuery = z.infer<typeof cartItemQuerySchema>;
