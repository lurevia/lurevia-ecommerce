import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { deliveryTrackingRepository, type DeliveryTrackingRepository } from "../repository/delivery-tracking.repository";
import type { ListMyDeliveriesQuery, PingInput } from "../dto";
import { DELIVERABLE_STATUSES } from "../lib/constant/delivery-tracking.constant";
import { trackingMapper } from "../mapper/tracking.mapper";

export class CourierService {
    constructor(
        private readonly repository: DeliveryTrackingRepository
    ) { }

    async ping(orderId: string, courierId: string, input: PingInput) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                status: true,
                userId: true,
                deliveryMode: true,
                orderNumber: true,
            },
        });
        if (!order) throw new NotFoundError("Commande");

        if (!DELIVERABLE_STATUSES.includes(order.status)) {
            throw new ConflictError(
                `Cette commande n'est pas en cours de livraison (statut : ${order.status}).`
            );
        }

        if (order.userId === courierId) {
            throw new ForbiddenError("Vous ne pouvez pas livrer votre propre commande.");
        }

        const assigned = await this.repository.findAssignedCourier(orderId);
        if (assigned && assigned.courierId && assigned.courierId !== courierId) {
            throw new ForbiddenError(
                "Cette livraison est déjà assignée à un autre livreur."
            );
        }

        const ping = await this.repository.create({
            order: { connect: { id: orderId } },
            courier: { connect: { id: courierId } },
            latitude: input.latitude,
            longitude: input.longitude,
            accuracy: input.accuracy,
            speed: input.speed,
            heading: input.heading,
        });

        if (order.status !== "SHIPPED") {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: "SHIPPED",
                    shippedAt: new Date(),
                },
            });
            logger.info(
                { orderId, courierId },
                "Commande passée en SHIPPED via ping livreur"
            );
        }

        logger.debug(
            { orderId, courierId, lat: input.latitude, lng: input.longitude },
            "Ping GPS enregistré"
        );

        return trackingMapper.toOutput(ping);
    }

    async listMyDeliveries(courierId: string, query: ListMyDeliveriesQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] =
            await this.repository.findActiveDeliveriesForCourier(
                courierId,
                (pagination.page - 1) * pagination.limit,
                pagination.limit
            );

        const byOrder = new Map<string, (typeof items)[number]>();
        for (const ping of items) {
            if (!byOrder.has(ping.orderId)) {
                byOrder.set(ping.orderId, ping);
            }
        }

        const mapped = Array.from(byOrder.values()).map((ping) => ({
            orderId: ping.orderId,
            orderNumber: ping.order.orderNumber,
            orderStatus: ping.order.status,
            customer: {
                fullName: ping.order.shippingFullName,
                city: ping.order.shippingCity,
                region: ping.order.shippingRegion,
            },
            lastPing: {
                latitude: ping.latitude,
                longitude: ping.longitude,
                recordedAt: ping.recordedAt,
            },
        }));

        return buildPaginatedResult(mapped, totalItems, pagination);
    }

    async getMyStats(courierId: string) {
        const stats = await this.repository.statsForCourier(courierId);
        return {
            totalPings: stats._count,
            lastPingAt: stats._max.recordedAt,
        };
    }
}

export const courierService = new CourierService(deliveryTrackingRepository);
