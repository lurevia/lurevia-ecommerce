import { prisma } from "../../lib/prisma";
import type { Prisma, DeliveryTracking } from "@prisma/client";

export const deliveryTrackingRepository = {
  // ─── Création d'un ping ───
  create: (data: Prisma.DeliveryTrackingCreateInput) =>
    prisma.deliveryTracking.create({ data }),

  // ─── Dernière position connue d'une commande ───
  findLatestForOrder: (orderId: string) =>
    prisma.deliveryTracking.findFirst({
      where: { orderId },
      orderBy: { recordedAt: "desc" },
      include: {
        courier: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
      },
    }),

  // ─── Historique complet d'une commande ───
  findHistoryForOrder: (orderId: string, limit: number) =>
    prisma.deliveryTracking.findMany({
      where: { orderId },
      orderBy: { recordedAt: "asc" },
      take: limit,
      include: {
        courier: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    }),

  // ─── Livreur assigné (premier ping) ───
  findAssignedCourier: async (
    orderId: string
  ): Promise<DeliveryTracking | null> =>
    prisma.deliveryTracking.findFirst({
      where: { orderId, courierId: { not: null } },
      orderBy: { recordedAt: "asc" },
    }),

  // ─── Commandes livrées par un livreur (dernier ping dans les X heures) ───
  findActiveDeliveriesForCourier: async (
    courierId: string,
    skip: number,
    take: number
  ) => {
    const [items, allDistinct] = await Promise.all([
      prisma.deliveryTracking.findMany({
        where: { courierId },
        distinct: ["orderId"],
        orderBy: { recordedAt: "desc" },
        skip,
        take,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              shippingFullName: true,
              shippingCity: true,
              shippingRegion: true,
            },
          },
        },
      }),
      prisma.deliveryTracking.findMany({
        where: { courierId },
        distinct: ["orderId"],
        select: { orderId: true },
      }),
    ]);
    return [items, allDistinct.length] as const;
  },

  // ─── Stats d'un livreur ───
  statsForCourier: (courierId: string) =>
    prisma.deliveryTracking.aggregate({
      where: { courierId },
      _count: true,
      _max: { recordedAt: true },
    }),
};