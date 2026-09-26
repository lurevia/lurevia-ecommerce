import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(1).max(1000),
  imageUrl: z.string().trim().min(1).max(2048),
  bannerUrl: z.string().trim().min(1).max(2048),
  iconName: z.string().trim().min(1).max(60).default("ShoppingBag"),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categorySlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(150),
});

export const categoryIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de catégorie invalide"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
