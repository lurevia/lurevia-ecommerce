import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { deliveryTrackingRepository, type DeliveryTrackingRepository } from "../repository/delivery-tracking.repository";
import type { HistoryQuery } from "../dto";
import { trackingMapper } from "../mapper/tracking.mapper";

export class TrackingQueryService {
    constructor(
        private readonly repository: DeliveryTrackingRepository
    ) { }

    async getLatest(orderId: string, requesterId: string, isAdmin: boolean) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, userId: true },
        });
        if (!order) throw new NotFoundError("Commande");

        const latest = await this.repository.findLatestForOrder(orderId);
        if (!latest) {
            return { position: null };
        }

        const isBuyer = order.userId === requesterId;
        const isCourier = latest.courierId === requesterId;
        if (!isBuyer && !isCourier && !isAdmin) {
            throw new ForbiddenError("Accès refusé.");
        }

        return { position: trackingMapper.toOutput(latest) };
    }

    async getHistory(
        orderId: string,
        requesterId: string,
        isAdmin: boolean,
        query: HistoryQuery
    ) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, userId: true, status: true },
        });
        if (!order) throw new NotFoundError("Commande");

        const isBuyer = order.userId === requesterId;
        if (!isBuyer && !isAdmin) {
            throw new ForbiddenError("Accès refusé.");
        }

        const pings = await this.repository.findHistoryForOrder(
            orderId,
            query.limit
        );

        return {
            orderId,
            orderStatus: order.status,
            pings: trackingMapper.toOutputList(pings),
            totalPings: pings.length,
        };
    }
}

export const trackingQueryService = new TrackingQueryService(deliveryTrackingRepository);
