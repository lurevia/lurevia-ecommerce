import { z } from "zod";
import { normalizeMalagasyPhone } from "../../utils/phone";

// ─────────────────────────────────────────────────────────────────────────────
// Schémas de base
// ─────────────────────────────────────────────────────────────────────────────

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const idParamsSchema = z.object({
  id: z.string().uuid("Identifiant invalide"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Filtres / listes
// ─────────────────────────────────────────────────────────────────────────────

export const listOrdersQuerySchema = listQuerySchema.extend({
  status: z
    .enum([
      "pending", "paid", "shipped", "delivered", "cancelled",
      "cod-pending", "cod-failed", "refunded", "payment-failed",
      "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED",
      "COD_PENDING", "COD_FAILED", "REFUNDED", "PAYMENT_FAILED",
    ])
    .optional(),
  paymentMethod: z
    .enum([
      "MOBILE_MONEY", "COD", "CARD", "BANK_TRANSFERT",
      "mobile-money", "cash", "bank-transfer", "card",
    ])
    .optional(),
  search: z.string().trim().max(150).optional(),
});

export const listUsersQuerySchema = listQuerySchema.extend({
  search: z.string().trim().max(150).optional(),
  role: z.enum(["CUSTOMER", "SELLER", "ADMIN"]).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  age: z.enum(["18-25", "26-35", "36-50", "51-99", "unknown"]).optional(),
});

export const listReviewsQuerySchema = listQuerySchema.extend({
  productId: z.string().uuid().optional(),
  search: z.string().trim().max(150).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const listFeedbackQuerySchema = listQuerySchema.extend({
  category: z.enum(["DELIVERY", "PAYMENT", "SUPPORT", "WEBSITE", "OTHER"]).optional(),
});

export const listDeletionRequestsQuerySchema = listQuerySchema.extend({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  search: z.string().trim().max(150).optional(),
});

export const listNotificationsQuerySchema = listQuerySchema.extend({
  unreadOnly: z.coerce.boolean().optional(),
});

export const sellerListQuerySchema = listQuerySchema.extend({
  search: z.string().trim().max(150).optional(),
  status: z.enum(["active", "pending", "suspended"]).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

export const updateUserRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "SELLER", "ADMIN"]),
});

export const processDeletionRequestSchema = z.object({
  adminNote: z.string().trim().max(1000).optional(),
});

export const feedbackResponseSchema = z.object({
  teamResponse: z.string().trim().min(1).max(2000),
});

export const rejectReviewSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export const verificationStatusQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "USED", "EXPIRED"]).optional(),
  search: z.string().trim().max(150).optional(),
});

export const verificationRejectSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

// ✅ NOUVEAU — Workflow CIN (IdentityVerification)
export const identityVerificationStatusQuerySchema = z.object({
  status: z
    .enum(["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED", "EXPIRED"])
    .optional(),
  isGuardian: z.coerce.boolean().optional(),
  search: z.string().trim().max(150).optional(),
});

export const identityVerificationRejectSchema = z.object({
  reason: z.string().trim().min(1, "La raison du rejet est requise").max(1000),
});

export const profileChangeStatusQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().trim().max(150).optional(),
});

export const reviewProfileChangeSchema = z.object({
  approved: z.boolean(),
  adminNote: z.string().trim().max(1000).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Message admin (broadcast ou ciblé)
// ─────────────────────────────────────────────────────────────────────────────

export const adminMessageSchema = z
  .object({
    userId: z.string().uuid().optional(),
    allUsers: z.boolean().optional(),
    subject: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(10000),
  })
  .refine((v) => Boolean(v.userId) !== Boolean(v.allUsers), {
    message: "Choisissez un utilisateur OU tous les utilisateurs, pas les deux.",
  });

// ─────────────────────────────────────────────────────────────────────────────
// Création d'admin (téléphone normalisé E.164)
// ─────────────────────────────────────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128)
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre");

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

export const createAdminSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(120),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  phone: phoneSchema,
  password: passwordSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// Types inférés
// ─────────────────────────────────────────────────────────────────────────────

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>;
export type ListDeletionRequestsQuery = z.infer<typeof listDeletionRequestsQuerySchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ProcessDeletionRequestInput = z.infer<typeof processDeletionRequestSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type SellerListQuery = z.infer<typeof sellerListQuerySchema>;
export type IdentityVerificationStatusQuery = z.infer<typeof identityVerificationStatusQuerySchema>;