import { z } from "zod";
import { SettlementStatus } from "@prisma/client";

export const listSettlementsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  status: z.nativeEnum(SettlementStatus).optional(),
});

export const settlementIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de règlement invalide"),
});

export type ListSettlementsQuery = z.infer<
  typeof listSettlementsQuerySchema
>;