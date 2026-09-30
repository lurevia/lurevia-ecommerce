import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { cartService } from "./cart.service";
import { sendSuccess } from "../../utils/apiResponse";
import type { CartItemQuery } from "./cart.validators";

export const cartController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.get(req.user!.id);
    sendSuccess(res, cart);
  }),

  addItem: asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity, colorId, sizeId } = req.body;
    const cart = await cartService.addItem(
      req.user!.id,
      productId,
      quantity,
      { colorId, sizeId }
    );
    sendSuccess(res, cart);
  }),

  updateItem: asyncHandler(async (req: Request, res: Response) => {
    const variants = req.query as CartItemQuery;
    const cart = await cartService.updateItem(
      req.user!.id,
      req.params.productId,
      req.body.quantity,
      variants
    );
    sendSuccess(res, cart);
  }),

  removeItem: asyncHandler(async (req: Request, res: Response) => {
    const variants = req.query as CartItemQuery;
    const cart = await cartService.removeItem(
      req.user!.id,
      req.params.productId,
      variants
    );
    sendSuccess(res, cart);
  }),

  clear: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.clear(req.user!.id);
    sendSuccess(res, cart);
  }),
};