import { z } from "zod";
import { BidStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Création d'offre (négociation OU enchère)
// ─────────────────────────────────────────────────────────────────────────────
export const createBidSchema = z.object({
    productId: z.string().uuid("ID du produit invalide"),
    proposedPrice: z
        .number()
        .int()
        .positive("Le prix proposé doit être un entier positif"),
    comment: z
        .string()
        .trim()
        .max(500, "Le commentaire ne peut pas dépasser 500 caractères")
        .optional(),

    isAutoBid: z.boolean().optional().default(false),
    autoBidMax: z.number().int().positive().optional(),
}).refine(
    (data) => !data.isAutoBid || (data.autoBidMax && data.autoBidMax >= data.proposedPrice),
    {
        message: "Le plafond d'auto-bid doit être ≥ au prix proposé",
        path: ["autoBidMax"],
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// Mise à jour du statut (vendeur/admin)
// ─────────────────────────────────────────────────────────────────────────────
export const updateBidStatusSchema = z.object({
    status: z.nativeEnum(BidStatus, {
        errorMap: () => ({ message: "Statut de l'offre invalide" }),
    }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Params
// ─────────────────────────────────────────────────────────────────────────────
export const productIdSchema = z.object({
    productId: z.string().uuid("ID du produit invalide"),
});

export const bidIdSchema = z.object({
    id: z.string().uuid("ID d'offre invalide"),
});

export const listProductBidsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type CreateBidInput = z.infer<typeof createBidSchema>;
export type UpdateBidStatusInput = z.infer<typeof updateBidStatusSchema>;
export type ListProductBidsQuery = z.infer<typeof listProductBidsQuerySchema>;
