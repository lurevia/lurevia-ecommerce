import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { cartService } from "./cart.service";

export const cartController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.get(req.user!.id);
    res.status(200).json({ data: cart });
  }),

  addItem: asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user!.id, productId, quantity);
    res.status(200).json({ data: cart });
  }),

  updateItem: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.updateItem(req.user!.id, req.params.productId, req.body.quantity);
    res.status(200).json({ data: cart });
  }),

  removeItem: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.removeItem(req.user!.id, req.params.productId);
    res.status(200).json({ data: cart });
  }),

  clear: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.clear(req.user!.id);
    res.status(200).json({ data: cart });
  }),
};
