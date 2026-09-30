import type { PickupPoint } from "@prisma/client";

export type PickupPointWithRelations = PickupPoint & {
  shippingZone?: { id: string; name: string; basePrice: number; estimatedDays?: number | null } | null;
  _count?: { addresses: number; orders: number };
};

export const toPickupPointDto = (p: PickupPointWithRelations) => ({
  id: p.id,
  name: p.name,
  provider: p.provider,
  phone: p.phone,
  email: p.email,
  province: p.province,
  region: p.region,
  city: p.city,
  address: p.address,
  latitude: p.latitude,
  longitude: p.longitude,
  shippingZone: p.shippingZone ?? null,
  isActive: p.isActive,
  addressesCount: p._count?.addresses ?? 0,
  ordersCount: p._count?.orders ?? 0,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});
