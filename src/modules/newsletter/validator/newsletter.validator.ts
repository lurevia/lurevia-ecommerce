import { z } from "zod";

export const subscribeSchema = z.object({
    email: z.string().trim().toLowerCase().email("Email invalide"),
});

export const confirmSchema = z.object({
    token: z.string().min(1, "Token requis").max(200),
});

export const unsubscribeSchema = z.object({
    email: z.string().trim().toLowerCase().email("Email invalide"),
    reason: z.string().trim().max(500).optional(),
});

export const listNewsletterQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type ConfirmInput = z.infer<typeof confirmSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
export type ListNewsletterQuery = z.infer<typeof listNewsletterQuerySchema>;
