import { z } from "zod";

export const addressBodySchema = z.object({
  label: z.string().trim().min(1).max(60),
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Numéro de téléphone invalide"),
  email: z.string().trim().toLowerCase().email(),
  address: z.string().trim().min(3).max(255),
  city: z.string().trim().min(1).max(100),
  region: z.string().trim().min(1).max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  notes: z.string().trim().max(500).optional(),
  isDefault: z.boolean().default(false),
});

export const updateAddressBodySchema = addressBodySchema.partial();

export const addressIdParamsSchema = z.object({
  id: z.string().cuid("Identifiant d'adresse invalide"),
});

export type AddressInput = z.infer<typeof addressBodySchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressBodySchema>;
