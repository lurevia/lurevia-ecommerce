import { z } from "zod";
import { SellerContractStatus } from "@prisma/client";

export const listSellerContractsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  status: z.nativeEnum(SellerContractStatus).optional(),
});

export const sellerContractIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de contrat invalide"),
});

export type ListSellerContractsQuery = z.infer<
  typeof listSellerContractsQuerySchema
>;