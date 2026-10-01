import { z } from "zod";
import { normalizeMalagasyPhone } from "../../../utils/phone";

const passwordSchema = z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128)
    .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre");

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(320),
    password: z.string().min(1, "Mot de passe requis").max(128),
}).strict();

const phoneSchema = z.string().trim().transform((value, ctx) => {
    const phone = normalizeMalagasyPhone(value);
    if (!phone) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Numéro malgache invalide." });
        return z.NEVER;
    }
    return phone;
});

export const registerSchema = z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(320),
    phone: phoneSchema,
    password: passwordSchema,
}).strict();

export const oauthCallbackSchema = z.object({
    provider: z.literal("FACEBOOK"),
    token: z.string().min(1, "Token requis"),
}).strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
