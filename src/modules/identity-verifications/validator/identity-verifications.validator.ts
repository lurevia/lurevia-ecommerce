import { z } from "zod";
import { GuardianRelation, IdentityVerificationStatus } from "@prisma/client";
import { normalizeMalagasyPhone } from "../../../utils/phone";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

const cinNumberSchema = z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Le CIN doit contenir exactement 12 chiffres");

// ─────────────────────────────────────────────────────────────────────────────
// SOUMISSION D'UNE VÉRIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export const submitVerificationSchema = z
    .object({
        isGuardianVerification: z.boolean().default(false),
        cinNumber: cinNumberSchema.optional(),
        guardianFullName: z.string().trim().min(2).max(120).optional(),
        guardianCinNumber: cinNumberSchema.optional(),
        guardianRelation: z.nativeEnum(GuardianRelation).optional(),
        guardianPhone: phoneSchema.optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
        if (data.isGuardianVerification) {
          if (!data.guardianFullName) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Le nom du tuteur est requis.",
              path: ["guardianFullName"],
            });
          }
          if (!data.guardianCinNumber) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Le CIN du tuteur est requis.",
              path: ["guardianCinNumber"],
            });
          }
          if (!data.guardianRelation) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Le lien de parenté est requis.",
              path: ["guardianRelation"],
            });
          }
        } else if (!data.cinNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Le numéro CIN est requis.",
            path: ["cinNumber"],
          });
        }
    });

// ─────────────────────────────────────────────────────────────────────────────
// STATUT & PARAMS
// ─────────────────────────────────────────────────────────────────────────────

export const listMyVerificationsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    status: z.nativeEnum(IdentityVerificationStatus).optional(),
});

export const verificationIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de vérification invalide"),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;
export type ListMyVerificationsQuery = z.infer<typeof listMyVerificationsQuerySchema>;
