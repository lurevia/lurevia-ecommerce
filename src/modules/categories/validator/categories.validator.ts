import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Créer / mettre à jour une catégorie
// ─────────────────────────────────────────────────────────────────────────────
export const createCategorySchema = z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(1).max(1000),
    imageUrl: z.string().url("URL d'image invalide").max(2048),
    bannerUrl: z.string().url("URL de bannière invalide").max(2048),
    iconName: z.string().trim().min(1).max(60).default("ShoppingBag"),
    position: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

// ✅ Réordonner plusieurs catégories en une fois
export const reorderCategoriesSchema = z.object({
    items: z
        .array(
            z.object({
                id: z.string().uuid(),
                position: z.number().int().min(0),
            })
        )
        .min(1)
        .max(100),
});

// ─────────────────────────────────────────────────────────────────────────────
// Params
// ─────────────────────────────────────────────────────────────────────────────
export const categorySlugParamsSchema = z.object({
    slug: z.string().trim().min(1).max(150),
});

export const categoryIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de catégorie invalide"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
