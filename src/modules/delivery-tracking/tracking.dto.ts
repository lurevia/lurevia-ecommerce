import type { OrderStatus } from "@prisma/client";

export const DELIVERABLE_STATUSES: OrderStatus[] = ["PAID", "COD_PENDING", "SHIPPED"];

export interface PingWithCourier {
  id: string;
  orderId: string;
  courierId: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  recordedAt: Date;
  courier?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phone?: string | null;
  } | null;
}

export const toPingDto = (p: PingWithCourier) => ({
  id: p.id,
  orderId: p.orderId,
  latitude: p.latitude,
  longitude: p.longitude,
  accuracy: p.accuracy,
  speed: p.speed,
  heading: p.heading,
  recordedAt: p.recordedAt,
  courier: p.courier
    ? {
        id: p.courier.id,
        fullName: p.courier.fullName,
        avatarUrl: p.courier.avatarUrl,
        phone: p.courier.phone,
      }
    : null,
});
