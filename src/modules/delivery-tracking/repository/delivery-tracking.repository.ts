import { prisma } from "../../../lib/prisma";
import type { Prisma, DeliveryTracking } from "@prisma/client";

export class DeliveryTrackingRepository {
    // ─── Création d'un ping ───
    create(data: Prisma.DeliveryTrackingCreateInput) {
        return prisma.deliveryTracking.create({ data });
    }

    // ─── Dernière position connue d'une commande ───
    findLatestForOrder(orderId: string) {
        return prisma.deliveryTracking.findFirst({
            where: { orderId },
            orderBy: { recordedAt: "desc" },
            include: {
                courier: {
                    select: { id: true, fullName: true, avatarUrl: true, phone: true },
                },
            },
        });
    }

    // ─── Historique complet d'une commande ───
    findHistoryForOrder(orderId: string, limit: number) {
        return prisma.deliveryTracking.findMany({
            where: { orderId },
            orderBy: { recordedAt: "asc" },
            take: limit,
            include: {
                courier: {
                    select: { id: true, fullName: true, avatarUrl: true },
                },
            },
        });
    }

    // ─── Livreur assigné (premier ping) ───
    async findAssignedCourier(orderId: string): Promise<DeliveryTracking | null> {
        return prisma.deliveryTracking.findFirst({
            where: { orderId, courierId: { not: null } },
            orderBy: { recordedAt: "asc" },
        });
    }

    // ─── Commandes livrées par un livreur (dernier ping dans les X heures) ───
    async findActiveDeliveriesForCourier(courierId: string,
        skip: number,
        take: number) {
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
    }

    // ─── Stats d'un livreur ───
    statsForCourier(courierId: string) {
        return prisma.deliveryTracking.aggregate({
            where: { courierId },
            _count: true,
            _max: { recordedAt: true },
        });
    }
}

export const deliveryTrackingRepository = new DeliveryTrackingRepository();
