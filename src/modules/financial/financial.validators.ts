import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Paramètres
// ─────────────────────────────────────────────────────────────────────────────
export const contractIdSchema = z.object({
  id: z.string().uuid("Identifiant invalide"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Listes
// ─────────────────────────────────────────────────────────────────────────────
export const contractListSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  sellerId: z.string().uuid().optional(),
  search: z.string().trim().max(150).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const financialListSchema = z.object({
  status: z
    .enum([
      "PENDING_REVIEW",
      "READY",
      "TRANSFER_PENDING",
      "PAID",
      "FAILED",
      "CANCELLED",
      "PENDING",
      "PROCESSING",
      "COMPLETED",
    ])
    .optional(),
  sellerId: z.string().uuid().optional(),
  search: z.string().trim().max(150).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// Création de contrat
// ─────────────────────────────────────────────────────────────────────────────
export const createContractSchema = z
  .object({
    type: z.enum(["PERCENTAGE", "MONTHLY_FIXED"]),
    value: z.coerce.number().int().nonnegative().max(100_000_000),
    effectiveFrom: z.coerce.date().optional(),
    effectiveTo: z.coerce.date().optional(),
  })
  .refine((v) => v.type !== "PERCENTAGE" || (v.value >= 0 && v.value <= 100), {
    message: "Le pourcentage doit être compris entre 0 et 100.",
    path: ["value"],
  })
  .refine(
    (v) => !v.effectiveFrom || !v.effectiveTo || v.effectiveFrom < v.effectiveTo,
    {
      message: "effectiveFrom doit être antérieur à effectiveTo.",
      path: ["effectiveTo"],
    }
  );

// ─────────────────────────────────────────────────────────────────────────────
// Révision de contrat
// ─────────────────────────────────────────────────────────────────────────────
export const reviewContractSchema = z
  .object({
    approved: z.boolean(),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.approved || (v.reason && v.reason.length > 0), {
    message: "Une raison est requise pour rejeter un contrat.",
    path: ["reason"],
  });

// ─────────────────────────────────────────────────────────────────────────────
// Création de transfert
// ─────────────────────────────────────────────────────────────────────────────
export const transferSchema = z.object({
  idempotencyKey: z.string().min(8).max(100),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type ContractListQuery = z.infer<typeof contractListSchema>;
export type FinancialListQuery = z.infer<typeof financialListSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type ReviewContractInput = z.infer<typeof reviewContractSchema>;
export type TransferInput = z.infer<typeof transferSchema>;