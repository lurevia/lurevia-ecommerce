import type { SellerSettlement, Order, SellerContract, TransferLedger } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────
export type SettlementWithRelations = SellerSettlement & {
  order: Pick<Order, "id" | "orderNumber" | "total">;
  contract: Pick<SellerContract, "id" | "version" | "type" | "value"> | null;
  transfers: Array<
    Pick<TransferLedger, "id" | "amount" | "status" | "createdAt" | "completedAt">
  >;
};
