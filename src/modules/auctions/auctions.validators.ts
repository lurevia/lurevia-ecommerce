import { z } from "zod";
import { AuctionStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// PARAMS
// ─────────────────────────────────────────────────────────────────────────────

export const productIdParamsSchema = z.object({
  productId: z.string().uuid("Identifiant de produit invalide"),
});

export const messageIdParamsSchema = z.object({
  productId: z.string().uuid(),
  messageId: z.string().uuid(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────────────────────────────────────

export const postMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Le message ne peut pas être vide")
    .max(500, "Le message est trop long (500 caractères max)"),
});

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

// ─────────────────────────────────────────────────────────────────────────────
// LISTE DES ENCHÈRES
// ─────────────────────────────────────────────────────────────────────────────

export const listAuctionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  status: z.nativeEnum(AuctionStatus).optional(),
  search: z.string().trim().max(150).optional(),
  sortBy: z
    .enum(["ending-soon", "newest", "most-bids", "price-desc"])
    .default("ending-soon"),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PostMessageInput = z.infer<typeof postMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
export type ListAuctionsQuery = z.infer<typeof listAuctionsQuerySchema>;