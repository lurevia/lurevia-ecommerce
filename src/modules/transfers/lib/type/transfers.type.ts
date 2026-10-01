import type { TransferLedger } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────
export type TransferWithRelations = TransferLedger & {
  settlement: {
    id: string;
    order: { orderNumber: string; };
  };
};
