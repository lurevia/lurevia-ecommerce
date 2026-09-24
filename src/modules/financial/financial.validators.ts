import { z } from "zod";

export const contractIdSchema = z.object({ id: z.string().uuid() });
export const contractListSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  sellerId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export const createContractSchema = z.object({
  type: z.enum(["PERCENTAGE", "MONTHLY_FIXED"]),
  value: z.coerce.number().int().nonnegative().max(100000000),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
}).refine((v) => v.type !== "PERCENTAGE" || v.value <= 100, { message: "Le pourcentage doit être compris entre 0 et 100.", path: ["value"] });
export const reviewContractSchema = z.object({
  approved: z.boolean(),
  reason: z.string().max(500).optional(),
});
export const financialListSchema = z.object({
  status: z.enum(["PENDING_REVIEW", "READY", "TRANSFER_PENDING", "PAID", "FAILED", "CANCELLED"]).optional(),
  sellerId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export const transferSchema = z.object({ idempotencyKey: z.string().min(8).max(100) });
