import { prisma } from "../../lib/prisma";
import type {
  Prisma,
  ProvinceMadagascar,
  RegionMadagascar,
} from "@prisma/client";

export const pickupPointsRepository = {
  // ─── Liste paginée (admin) ───
  findMany: (
    where: Prisma.PickupPointWhereInput,
    skip: number,
    take: number
  ) =>
    prisma.$transaction([
      prisma.pickupPoint.findMany({
        where,
        orderBy: [{ province: "asc" }, { city: "asc" }, { name: "asc" }],
        skip,
        take,
        include: {
          shippingZone: {
            select: { id: true, name: true, basePrice: true, estimatedDays: true },
          },
          _count: { select: { addresses: true, orders: true } },
        },
      }),
      prisma.pickupPoint.count({ where }),
    ]),

  // ─── Liste publique (actifs seulement) ───
  findActive: (filters?: {
    province?: ProvinceMadagascar;
    region?: RegionMadagascar;
    city?: string;
  }) =>
    prisma.pickupPoint.findMany({
      where: {
        isActive: true,
        ...(filters?.province ? { province: filters.province } : {}),
        ...(filters?.region ? { region: filters.region } : {}),
        ...(filters?.city
          ? { city: { contains: filters.city, mode: "insensitive" } }
          : {}),
      },
      orderBy: [{ city: "asc" }, { provider: "asc" }],
      select: {
        id: true,
        name: true,
        provider: true,
        phone: true,
        province: true,
        region: true,
        city: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    }),

  // ─── Points relais d'une région (utilisé au checkout) ───
  findByRegion: (region: RegionMadagascar) =>
    prisma.pickupPoint.findMany({
      where: { isActive: true, region },
      orderBy: [{ city: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        provider: true,
        city: true,
        address: true,
      },
    }),

  // ─── Détail ───
  findById: (id: string) =>
    prisma.pickupPoint.findUnique({
      where: { id },
      include: {
        shippingZone: {
          select: { id: true, name: true, basePrice: true, estimatedDays: true },
        },
        _count: { select: { addresses: true, orders: true } },
      },
    }),

  // ─── Unicité : même provider + même nom dans même ville ───
  findByNameAndProvider: (
    name: string,
    provider: string,
    city: string
  ) =>
    prisma.pickupPoint.findFirst({
      where: { name, provider, city },
    }),

  // ─── CRUD ───
  create: (data: Prisma.PickupPointCreateInput) =>
    prisma.pickupPoint.create({ data }),

  update: (id: string, data: Prisma.PickupPointUpdateInput) =>
    prisma.pickupPoint.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.pickupPoint.delete({ where: { id } }),

  // ─── Stats ───
  countByRegion: (region: RegionMadagascar) =>
    prisma.pickupPoint.count({
      where: { isActive: true, region },
    }),
};