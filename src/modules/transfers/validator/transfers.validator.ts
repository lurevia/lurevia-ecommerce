import { z } from "zod";
import { TransferStatus } from "@prisma/client";

export const listTransfersQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    status: z.nativeEnum(TransferStatus).optional(),
});

export const transferIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de transfert invalide"),
});

export type ListTransfersQuery = z.infer<typeof listTransfersQuerySchema>;
