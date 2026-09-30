import { z } from "zod";
import {
  MobileMoneyProvider,
  TransactionStatus,
} from "@prisma/client";
import { normalizeMalagasyPhone } from "../../utils/phone";


const phoneSchema = z
  .string()
  .trim()
  .transform((val, ctx) => {
    const normalized = normalizeMalagasyPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Numéro malgache invalide (ex : 034 12 345 67)",
      });
      return z.NEVER;
    }
    return normalized;
  });


export const initiatePaymentSchema = z.object({
  orderId: z.string().uuid("Identifiant de commande invalide"),
  provider: z.nativeEnum(MobileMoneyProvider),
  phoneNumber: phoneSchema,
});


export const refundSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});

export const transactionIdParamsSchema = z.object({
  transactionId: z.string().uuid("Identifiant de transaction invalide"),
});

export const providerParamsSchema = z.object({
  provider: z.nativeEnum(MobileMoneyProvider),
});

export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  status: z.nativeEnum(TransactionStatus).optional(),
  provider: z.nativeEnum(MobileMoneyProvider).optional(),
});


export const webhookPayloadSchema = z
  .object({
    externalId: z.string().min(1),
    status: z.enum(["SUCCESS", "FAILED", "PENDING", "CANCELLED"]),
    amount: z.number().int().positive().optional(),
    currency: z.string().length(3).optional(),
    message: z.string().optional(),
    timestamp: z.string().optional(),
  })
  .passthrough();


export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;