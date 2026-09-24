import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128)
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+261|0)[0-9]{9}$/,
    "Numéro malgache invalide (ex : 034 12 345 67)"
  );

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  phone: phoneSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  identifier: z.string().trim().toLowerCase().refine(
    (val) => z.string().email().safeParse(val).success || /^(\+261|0)[0-9]{9}$/.test(val),
    "L'identifiant doit être un email valide ou un numéro de téléphone malgache"
  ),
  password: z.string().min(1, "Mot de passe requis").max(128),
});

export const verificationCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Le code doit contenir 6 chiffres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: passwordSchema,
});

export const oauthCallbackSchema = z.object({
  provider: z.enum(["GOOGLE", "FACEBOOK"]),
  token: z.string().min(1, "Token requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerificationCodeInput = z.infer<typeof verificationCodeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
