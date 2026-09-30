import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { shippingZonesService } from "./shipping-zones.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";
import type {
  ListZonesQuery,
} from "./shipping-zones.validators";

export const shippingZonesController = {
  // ─── Public ───
  listPublic: asyncHandler(async (_req: Request, res: Response) => {
    const zones = await shippingZonesService.listPublic();
    sendSuccess(res, { zones });
  }),

  // ─── Admin ───
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await shippingZonesService.list(
      req.query as unknown as ListZonesQuery
    );
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const zone = await shippingZonesService.getById(req.params.id);
    sendSuccess(res, { zone });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const zone = await shippingZonesService.create(req.body);
    sendCreated(res, { zone });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const zone = await shippingZonesService.update(
      req.params.id,
      req.body
    );
    sendSuccess(res, { zone });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await shippingZonesService.remove(req.params.id);
    sendNoContent(res);
  }),
};