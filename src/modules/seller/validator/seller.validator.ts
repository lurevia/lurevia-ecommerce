import { z } from "zod";
import { createProductSchema, updateProductSchema } from "../../products/validator/products.validator";

export const sellerProductIdSchema = z.object({ id: z.string().min(1) });
export const productDeletionRequestSchema = z.object({
    reason: z.string().trim().min(5).max(1000),
}).strict();
export const sellerListSchema = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20) });
export const sellerStatusSchema = z.object({ status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "COD_PENDING", "COD_FAILED", "REFUNDED", "PAYMENT_FAILED"]) });
export const applySellerSchema = z.object({
    type: z.enum(["PERCENTAGE", "MONTHLY_FIXED"]).default("PERCENTAGE"),
    value: z.coerce.number().int().nonnegative().max(100000000).default(10),
    storeName: z.string().trim().min(2).max(100),
    storeDescription: z.string().trim().min(5).max(1000),
    storeCategoryId: z.string().uuid().optional(),
    storeCategoryIds: z.array(z.string().uuid()).min(1, "Au moins une catégorie est requise").max(3, "Une boutique ne peut appartenir qu'à 3 catégories maximum").optional(),
    storeLogoUrl: z.string().trim().url().max(2048).optional(),
    storeCoverUrl: z.string().trim().url().max(2048).optional(),
    // SEO spécifique à la boutique
    metaTitle: z.string().trim().max(120).optional(),
    metaDescription: z.string().trim().max(255).optional(),
    metaKeywords: z.array(z.string().trim()).max(20).optional(),
    ogImageUrl: z.string().trim().url().max(2048).optional(),
}).strict().refine((v) => v.type !== "PERCENTAGE" || v.value <= 100, {
    message: "Le pourcentage doit être compris entre 0 et 100.",
    path: ["value"],
}).refine((v) => Boolean(v.storeCategoryId || (v.storeCategoryIds && v.storeCategoryIds.length > 0)), {
    message: "Veuillez renseigner au moins une catégorie pour la boutique.",
    path: ["storeCategoryIds"],
});

export const updateSellerProfileSchema = z.object({
    storeName: z.string().trim().min(2).max(100).optional(),
    storeDescription: z.string().trim().max(1000).optional(),
    storeLogoUrl: z.string().trim().url().max(2048).nullable().optional(),
    storeCoverUrl: z.string().trim().url().max(2048).nullable().optional(),
    storeCategoryId: z.string().uuid().optional(),
    storeCategoryIds: z.array(z.string().uuid()).min(1, "Au moins une catégorie est requise").max(3, "Une boutique ne peut appartenir qu'à 3 catégories maximum").optional(),
    // SEO spécifique à la boutique
    metaTitle: z.string().trim().max(120).nullable().optional(),
    metaDescription: z.string().trim().max(255).nullable().optional(),
    metaKeywords: z.array(z.string().trim()).max(20).optional(),
    ogImageUrl: z.string().trim().url().max(2048).nullable().optional(),
}).strict();
export const publicSellerListSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
    search: z.string().trim().max(100).optional(),
}).strict();
export const publicSellerIdSchema = z.object({
    id: z.string().uuid("Identifiant vendeur invalide."),
}).strict();
export { createProductSchema, updateProductSchema };
