import { z } from "zod";

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const listOrdersQuerySchema = listQuerySchema.extend({
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]).optional(),
  search: z.string().trim().max(150).optional(),
});

export const listUsersQuerySchema = listQuerySchema.extend({
  search: z.string().trim().max(150).optional(),
});

export const listReviewsQuerySchema = listQuerySchema.extend({
  productId: z.string().cuid().optional(),
});

export const listFeedbackQuerySchema = listQuerySchema.extend({
  category: z.enum(["DELIVERY", "PAYMENT", "SUPPORT", "WEBSITE", "OTHER"]).optional(),
});

export const feedbackResponseSchema = z.object({
  teamResponse: z.string().trim().min(1).max(2000),
});

export const listDeletionRequestsQuerySchema = listQuerySchema.extend({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const listNotificationsQuerySchema = listQuerySchema.extend({
  unreadOnly: z.coerce.boolean().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "SELLER", "ADMIN"]),
});

export const processDeletionRequestSchema = z.object({
  adminNote: z.string().trim().max(1000).optional(),
});

export const idParamsSchema = z.object({ id: z.string().cuid("Identifiant invalide") });
export const verificationStatusQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "USED", "EXPIRED"]).optional(),
});
export const verificationRejectSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});
export const profileChangeStatusQuerySchema = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional() });
export const adminMessageSchema = z.object({
  userId: z.string().cuid().optional(),
  allUsers: z.boolean().optional(),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
}).refine((v) => Boolean(v.userId) !== Boolean(v.allUsers), { message: "Choisissez un utilisateur ou tous les utilisateurs." });
export const reviewProfileChangeSchema = z.object({ approved: z.boolean(), adminNote: z.string().trim().max(1000).optional() });
export const createAdminSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(120),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  phone: z.string().trim().regex(/^(\+261|0)[0-9]{9}$/, "Numéro malgache invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(128)
    .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre"),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>;
export type ListDeletionRequestsQuery = z.infer<typeof listDeletionRequestsQuerySchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ProcessDeletionRequestInput = z.infer<typeof processDeletionRequestSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
