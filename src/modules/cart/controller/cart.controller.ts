import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { cartService, type CartService } from "../services/cart.service";
import { sendSuccess } from "../../../utils/apiResponse";
import type { CartItemQuery } from "../dto";

export class CartController {
    constructor(
        private readonly service: CartService
    ) { }

    get = asyncHandler(async (req: Request, res: Response) => {
        const cart = await this.service.get(req.user!.id);
        sendSuccess(res, cart);
    });

    addItem = asyncHandler(async (req: Request, res: Response) => {
        const { productId, quantity, colorId, sizeId } = req.body;
        const cart = await this.service.addItem(
            req.user!.id,
            productId,
            quantity,
            { colorId, sizeId }
        );
        sendSuccess(res, cart);
    });

    updateItem = asyncHandler(async (req: Request, res: Response) => {
        const variants = req.query as CartItemQuery;
        const cart = await this.service.updateItem(
            req.user!.id,
            req.params.productId,
            req.body.quantity,
            variants
        );
        sendSuccess(res, cart);
    });

    removeItem = asyncHandler(async (req: Request, res: Response) => {
        const variants = req.query as CartItemQuery;
        const cart = await this.service.removeItem(
            req.user!.id,
            req.params.productId,
            variants
        );
        sendSuccess(res, cart);
    });

    clear = asyncHandler(async (req: Request, res: Response) => {
        const cart = await this.service.clear(req.user!.id);
        sendSuccess(res, cart);
    });
}

export const cartController = new CartController(cartService);
