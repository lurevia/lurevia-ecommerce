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
  .regex(/^\+?[0-9\s-]{7,20}$/, "Numéro de téléphone invalide");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().optional(),
    phone: phoneSchema.optional(),
    password: passwordSchema,
    primaryIdentifier: z.enum(["email", "phone"]),
  })
  .superRefine((data, ctx) => {
    if (data.primaryIdentifier === "email" && !data.email) {
      ctx.addIssue({ code: "custom", message: "Email requis", path: ["email"] });
    }
    if (data.primaryIdentifier === "phone" && !data.phone) {
      ctx.addIssue({ code: "custom", message: "Téléphone requis", path: ["phone"] });
    }
    if (!data.email && !data.phone) {
      ctx.addIssue({ code: "custom", message: "Email ou téléphone requis", path: ["email"] });
    }
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(150),
  password: z.string().min(1).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
