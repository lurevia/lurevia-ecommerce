import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ordersService } from "./orders.service";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import type { ListOrdersQuery } from "./orders.validators";

export const ordersController = {
  checkout: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.checkout(req.user!.id, req.body);
    sendCreated(res, { order });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ListOrdersQuery;
    const result = await ordersService.list(req.user!.id, page, limit);
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.getById(req.user!.id, req.params.id);
    sendSuccess(res, { order });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.cancel(req.user!.id, req.params.id);
    sendSuccess(res, { order });
  }),

  adminUpdateStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.adminUpdateStatus(
      req.params.id,
      req.body.status
    );
    sendSuccess(res, { order });
  }),
};