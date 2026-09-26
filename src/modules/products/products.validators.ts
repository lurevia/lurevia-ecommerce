import { z } from "zod";

const csvToArray = (value: unknown): string[] | undefined => {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return value.split(",").map((v) => v.trim()).filter(Boolean);
};

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  categories: z.preprocess(csvToArray, z.array(z.string()).optional()),
  sizes: z.preprocess(csvToArray, z.array(z.string().trim().min(1).max(60)).optional()),
  colors: z.preprocess(csvToArray, z.array(z.string()).optional()),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().nonnegative().optional(),
  availability: z.enum(["all", "in-stock", "out-of-stock"]).default("all"),
  categoryId: z.string().uuid().optional(),
  priceRange: z.string().regex(/^\d+-\d+$/).optional(),
  stock: z.enum(["out", "low", "in", "high"]).optional(),
  status: z.enum(["new", "promo", "popular"]).optional(),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "rating-desc", "popular"]).default("newest"),
  search: z.string().trim().max(150).optional(),
});

export const productIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de produit invalide"),
});

export const searchSuggestionsQuerySchema = z.object({
  q: z.string().trim().min(1).max(150),
  limit: z.coerce.number().int().positive().max(20).default(6),
});

const colorSchema = z.object({
  label: z.string().trim().min(1).max(60),
  hex: z
    .string()
    .trim()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Code couleur hexadécimal invalide"),
});

export const createProductSchema = z.object({
  title: z.string().trim().min(2).max(200),
  sku: z.string().trim().min(2).max(60),
  description: z.string().trim().max(500).optional(),
  longDescription: z.string().trim().max(5000).optional(),
  price: z.number().int().positive(),
  originalPrice: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().default(0),
  isNew: z.boolean().default(false),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  categoryIds: z.array(z.string().uuid()).min(1, "Au moins une catégorie est requise"),
  images: z.array(z.string().trim().min(1).max(2048)).min(1, "Au moins une image est requise"),
  colors: z.array(colorSchema).default([]),
  sizes: z.array(z.string().trim().min(1).max(60)).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
