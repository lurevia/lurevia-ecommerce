import { prisma } from "../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import { deliveryTrackingRepository } from "./delivery-tracking.repository";
import { toPingDto } from "./tracking.dto";
import type { HistoryQuery } from "./delivery-tracking.validators";

export const trackingQueryService = {
  async getLatest(orderId: string, requesterId: string, isAdmin: boolean) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true },
    });
    if (!order) throw new NotFoundError("Commande");

    const latest = await deliveryTrackingRepository.findLatestForOrder(orderId);
    if (!latest) {
      return { position: null };
    }

    const isBuyer = order.userId === requesterId;
    const isCourier = latest.courierId === requesterId;
    if (!isBuyer && !isCourier && !isAdmin) {
      throw new ForbiddenError("Accès refusé.");
    }

    return { position: toPingDto(latest) };
  },

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

    const pings = await deliveryTrackingRepository.findHistoryForOrder(
      orderId,
      query.limit
    );

    return {
      orderId,
      orderStatus: order.status,
      pings: pings.map(toPingDto),
      totalPings: pings.length,
    };
  },
};
