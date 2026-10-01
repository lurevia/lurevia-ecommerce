import { z } from "zod";
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

const passwordSchema = z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128)
    .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre");

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFIL
// ─────────────────────────────────────────────────────────────────────────────

export const updateProfileSchema = z
    .object({
        fullName: z.string().trim().min(2).max(120).optional(),
        email: z.string().trim().toLowerCase().email().max(320).optional(),
        phone: phoneSchema.optional(),
        avatarUrl: z.string().trim().url().max(2048).nullable().optional(),
    })
    .strict();

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: passwordSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPLÉTION DE PROFIL OAUTH
// ─────────────────────────────────────────────────────────────────────────────

export const completeOAuthProfileSchema = z
    .object({
        fullName: z.string().trim().min(2).max(120).optional(),
        phone: phoneSchema,
        password: passwordSchema,
    })
    .strict();

// ─────────────────────────────────────────────────────────────────────────────
// DEMANDE DE SUPPRESSION
// ─────────────────────────────────────────────────────────────────────────────

export const requestDeletionSchema = z.object({
    reason: z.string().trim().max(1000).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CompleteOAuthProfileInput = z.infer<typeof completeOAuthProfileSchema>;
export type RequestDeletionInput = z.infer<typeof requestDeletionSchema>;
