import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { deliveryTrackingService } from "./delivery-tracking.service";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import type {
  HistoryQuery,
  ListMyDeliveriesQuery,
} from "./delivery-tracking.validators";

export const deliveryTrackingController = {
  ping: asyncHandler(async (req: Request, res: Response) => {
    const ping = await deliveryTrackingService.ping(
      req.params.orderId,
      req.user!.id,
      req.body
    );
    sendCreated(res, { ping });
  }),

  getLatest: asyncHandler(async (req: Request, res: Response) => {
    const result = await deliveryTrackingService.getLatest(
      req.params.orderId,
      req.user!.id,
      req.user!.role === "ADMIN"
    );
    sendSuccess(res, result);
  }),

  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const result = await deliveryTrackingService.getHistory(
      req.params.orderId,
      req.user!.id,
      req.user!.role === "ADMIN",
      req.query as unknown as HistoryQuery
    );
    sendSuccess(res, result);
  }),

  listMyDeliveries: asyncHandler(async (req: Request, res: Response) => {
    const result = await deliveryTrackingService.listMyDeliveries(
      req.user!.id,
      req.query as unknown as ListMyDeliveriesQuery
    );
    sendSuccess(res, result);
  }),

  getMyStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await deliveryTrackingService.getMyStats(req.user!.id);
    sendSuccess(res, { stats });
  }),
};