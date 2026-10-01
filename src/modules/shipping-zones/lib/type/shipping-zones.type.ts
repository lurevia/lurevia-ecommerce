import type { ShippingZone } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────
export type ZoneWithCounts = ShippingZone & {
  _count?: { orders: number; pickupPoints: number; };
};
