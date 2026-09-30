import { z } from "zod";
import { createProductSchema, updateProductSchema } from "../products/products.validators";
export const sellerProductIdSchema = z.object({ id: z.string().min(1) });
export const sellerListSchema = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20) });
export const sellerStatusSchema = z.object({ status: z.enum(["PENDING","PAID","SHIPPED","DELIVERED","CANCELLED","COD_PENDING","COD_FAILED","REFUNDED","PAYMENT_FAILED"]) });
export const applySellerSchema = z.object({
  type: z.enum(["PERCENTAGE", "MONTHLY_FIXED"]),
  value: z.coerce.number().int().nonnegative().max(100000000),
}).refine((v) => v.type !== "PERCENTAGE" || v.value <= 100, {
  message: "Le pourcentage doit être compris entre 0 et 100.",
  path: ["value"],
});
export { createProductSchema, updateProductSchema };
