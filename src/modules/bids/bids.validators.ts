import { z } from "zod";
import { BidStatus } from "@prisma/client";

export const createBidSchema = z.object({
  productId: z.string().uuid("ID du produit invalide"),
  proposedPrice: z.number().int().positive("Le prix proposé doit être un entier positif"),
  comment: z.string().trim().max(500, "Le commentaire ne peut pas dépasser 500 caractères").optional(),
});

export const updateBidStatusSchema = z.object({
  status: z.nativeEnum(BidStatus, {
    errorMap: () => ({ message: "Statut de l'offre invalide" }),
  }),
});

export const productIdSchema = z.object({
  productId: z.string().uuid("ID du produit invalide"),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;
export type UpdateBidStatusInput = z.infer<typeof updateBidStatusSchema>;
