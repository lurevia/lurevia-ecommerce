import { z } from "zod";
import { createProductSchema, updateProductSchema } from "../products/products.validators";
export const sellerProductIdSchema = z.object({ id: z.string().min(1) });
export const sellerListSchema = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20) });
export const sellerStatusSchema = z.object({ status: z.enum(["PENDING","PAID","SHIPPED","DELIVERED","CANCELLED","COD_PENDING","COD_FAILED","REFUNDED","PAYMENT_FAILED"]) });
export { createProductSchema, updateProductSchema };
