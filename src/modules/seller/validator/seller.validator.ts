import { z } from "zod";
import { createProductSchema, updateProductSchema } from "../../products/validator/products.validator";

export const sellerProductIdSchema = z.object({ id: z.string().min(1) });
export const sellerListSchema = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20) });
export const sellerStatusSchema = z.object({ status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "COD_PENDING", "COD_FAILED", "REFUNDED", "PAYMENT_FAILED"]) });
export const applySellerSchema = z.object({
    type: z.enum(["PERCENTAGE", "MONTHLY_FIXED"]),
    value: z.coerce.number().int().nonnegative().max(100000000),
    storeName: z.string().trim().min(2).max(100),
    storeDescription: z.string().trim().min(20).max(1000),
    storeCategoryId: z.string().uuid(),
    storeLogoUrl: z.string().trim().url().max(2048).optional(),
    storeCoverUrl: z.string().trim().url().max(2048).optional(),
}).strict().refine((v) => v.type !== "PERCENTAGE" || v.value <= 100, {
    message: "Le pourcentage doit être compris entre 0 et 100.",
    path: ["value"],
});
export const updateSellerProfileSchema = z.object({
    storeName: z.string().trim().min(2).max(100),
    storeDescription: z.string().trim().min(20).max(1000),
    storeLogoUrl: z.string().trim().url().max(2048).nullable().optional(),
    storeCoverUrl: z.string().trim().url().max(2048).nullable().optional(),
    storeCategoryId: z.string().uuid().optional(),
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
