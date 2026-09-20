import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ordersService } from "./orders.service";

export const ordersController = {
  checkout: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.checkout(req.user!.id, req.body);
    res.status(201).json({ data: { order } });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page?: number; limit?: number };
    const result = await ordersService.list(req.user!.id, page, limit);
    res.status(200).json({ data: result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.getById(req.user!.id, req.params.id);
    res.status(200).json({ data: { order } });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.cancel(req.user!.id, req.params.id);
    res.status(200).json({ data: { order } });
  }),

  adminUpdateStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.adminUpdateStatus(req.params.id, req.body.status);
    res.status(200).json({ data: { order } });
  }),
};
