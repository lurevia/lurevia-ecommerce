import { z } from "zod";

export const notificationIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de notification invalide"),
});

export const listNotificationsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(30),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
