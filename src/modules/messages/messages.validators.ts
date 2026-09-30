import { z } from "zod";

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const messageIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de message invalide"),
});

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;