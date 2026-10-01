import { z } from "zod";
import { IdentityDocumentType, GuardianRelation, IdentityVerificationStatus } from "@prisma/client";
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
        // Si false → vérification personnelle (CIN de l'utilisateur)
        // Si true  → vérification par tuteur (mineur / sans CIN)
        isGuardianVerification: z.boolean().default(false),

        // ─── Cas personnel ───
        documentType: z.nativeEnum(IdentityDocumentType).optional(),
        documentNumber: z.string().trim().min(4).max(50).optional(),
        documentUrl: z.string().url().max(2048).optional(),
        documentUrlBack: z.string().url().max(2048).optional(),
        selfieUrl: z.string().url().max(2048).optional(),
        cinNumber: cinNumberSchema.optional(),

        // ─── Cas tuteur ───
        guardianFullName: z.string().trim().min(2).max(120).optional(),
        guardianCinNumber: cinNumberSchema.optional(),
        guardianRelation: z.nativeEnum(GuardianRelation).optional(),
        guardianCinDocumentUrl: z.string().url().max(2048).optional(),
        guardianPhone: phoneSchema.optional(),
        guardianConsentProofUrl: z.string().url().max(2048).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.isGuardianVerification) {
            // Tous les champs tuteur obligatoires
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
            if (!data.guardianCinDocumentUrl) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le scan du CIN du tuteur est requis.",
                    path: ["guardianCinDocumentUrl"],
                });
            }
            if (!data.guardianConsentProofUrl) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La preuve de consentement signée est requise.",
                    path: ["guardianConsentProofUrl"],
                });
            }
        } else {
            // Tous les champs personnels obligatoires
            if (!data.documentType) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le type de document est requis.",
                    path: ["documentType"],
                });
            }
            if (!data.documentNumber) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le numéro du document est requis.",
                    path: ["documentNumber"],
                });
            }
            if (!data.documentUrl) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le recto du document est requis.",
                    path: ["documentUrl"],
                });
            }
            if (data.documentType === "CIN" && !data.cinNumber) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le numéro CIN est requis.",
                    path: ["cinNumber"],
                });
            }
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
