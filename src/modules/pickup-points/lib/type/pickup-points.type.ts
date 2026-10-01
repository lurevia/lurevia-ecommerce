import type { PickupPoint } from "@prisma/client";

export type PickupPointWithRelations = PickupPoint & {
  shippingZone?: { id: string; name: string; basePrice: number; estimatedDays?: number | null; } | null;
  _count?: { addresses: number; orders: number; };
};
