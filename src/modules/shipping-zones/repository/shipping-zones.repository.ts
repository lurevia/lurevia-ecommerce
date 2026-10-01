import { prisma } from "../../../lib/prisma";
import type { Prisma, ProvinceMadagascar, RegionMadagascar } from "@prisma/client";

export class ShippingZonesRepository {
    // ─── Liste paginée (admin) ───
    findMany(where: Prisma.ShippingZoneWhereInput,
        skip: number,
        take: number) {
        return prisma.$transaction([
            prisma.shippingZone.findMany({
                where,
                orderBy: [{ basePrice: "asc" }, { name: "asc" }],
                skip,
                take,
                include: {
                    _count: { select: { orders: true, pickupPoints: true } },
                },
            }),
            prisma.shippingZone.count({ where }),
        ]);
    }

    // ─── Zones actives publiques ───
    findActive() {
        return prisma.shippingZone.findMany({
            where: { isActive: true },
            orderBy: { basePrice: "asc" },
            select: {
                id: true,
                name: true,
                province: true,
                regions: true,
                basePrice: true,
                pricePerKg: true,
                estimatedDays: true,
            },
        });
    }

    // ─── Zone pour une région donnée (utilisé au checkout) ───
    findByRegion(region: RegionMadagascar) {
        return prisma.shippingZone.findFirst({
            where: {
                isActive: true,
                regions: { has: region },
            },
            orderBy: { basePrice: "asc" },
        });
    }

    // ─── Zone pour une province entière (fallback) ───
    findByProvince(province: ProvinceMadagascar) {
        return prisma.shippingZone.findFirst({
            where: {
                isActive: true,
                province,
            },
            orderBy: { basePrice: "asc" },
        });
    }

    // ─── Détail ───
    findById(id: string) {
        return prisma.shippingZone.findUnique({
            where: { id },
            include: {
                _count: { select: { orders: true, pickupPoints: true } },
            },
        });
    }

    findByName(name: string) {
        return prisma.shippingZone.findUnique({ where: { name } });
    }

    // ─── CRUD ───
    create(data: Prisma.ShippingZoneCreateInput) {
        return prisma.shippingZone.create({ data });
    }

    update(id: string, data: Prisma.ShippingZoneUpdateInput) {
        return prisma.shippingZone.update({ where: { id }, data });
    }

    delete(id: string) {
        return prisma.shippingZone.delete({ where: { id } });
    }
}

export const shippingZonesRepository = new ShippingZonesRepository();
