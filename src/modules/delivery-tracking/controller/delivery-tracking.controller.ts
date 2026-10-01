import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { deliveryTrackingService, type DeliveryTrackingService } from "../services/delivery-tracking.service";
import { sendSuccess, sendCreated } from "../../../utils/apiResponse";
import type { HistoryQuery, ListMyDeliveriesQuery } from "../dto";

export class DeliveryTrackingController {
    constructor(
        private readonly service: DeliveryTrackingService
    ) { }

    ping = asyncHandler(async (req: Request, res: Response) => {
        const ping = await this.service.ping(
            req.params.orderId,
            req.user!.id,
            req.body
        );
        sendCreated(res, { ping });
    });

    getLatest = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.getLatest(
            req.params.orderId,
            req.user!.id,
            req.user!.role === "ADMIN"
        );
        sendSuccess(res, result);
    });

    getHistory = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.getHistory(
            req.params.orderId,
            req.user!.id,
            req.user!.role === "ADMIN",
            req.query as unknown as HistoryQuery
        );
        sendSuccess(res, result);
    });

    listMyDeliveries = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listMyDeliveries(
            req.user!.id,
            req.query as unknown as ListMyDeliveriesQuery
        );
        sendSuccess(res, result);
    });

    getMyStats = asyncHandler(async (req: Request, res: Response) => {
        const stats = await this.service.getMyStats(req.user!.id);
        sendSuccess(res, { stats });
    });
}

export const deliveryTrackingController = new DeliveryTrackingController(deliveryTrackingService);
