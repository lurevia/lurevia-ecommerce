import { z } from "zod";
import { normalizeMalagasyPhone } from "../../utils/phone";


export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .transform((val) => {
      if (val.includes("@")) return val.toLowerCase();
      const normalized = normalizeMalagasyPhone(val);
      return normalized ?? val;
    })
    .refine(
      (val) =>
        z.string().email().safeParse(val).success ||
        /^\+261\d{9}$/.test(val),
      "L'identifiant doit être un email valide ou un numéro de téléphone malgache"
    ),
  password: z.string().min(1, "Mot de passe requis").max(128),
});

export const oauthCallbackSchema = z.object({
  provider: z.enum(["GOOGLE", "FACEBOOK"]),
  token: z.string().min(1, "Token requis"),
});


export type LoginInput = z.infer<typeof loginSchema>;
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;