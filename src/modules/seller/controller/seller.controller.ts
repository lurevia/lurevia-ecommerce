import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sellerService, type SellerService } from "../services/seller.service";

export class SellerController {
    constructor(
        private readonly service: SellerService
    ) { }

    apply = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: await this.service.apply(req.user!.id, req.body) }));

    products = asyncHandler(async (req: Request, res: Response) => res.json({ data: { products: await this.service.listProducts(req.user!.id, Number(req.query.page), Number(req.query.limit)) } }));

    createProduct = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: { product: await this.service.createProduct(req.user!.id, req.body) } }));

    updateProduct = asyncHandler(async (req: Request, res: Response) => res.json({ data: { product: await this.service.updateProduct(req.user!.id, req.params.id, req.body) } }));

    removeProduct = asyncHandler(async (req: Request, res: Response) => { await this.service.removeProduct(req.user!.id, req.params.id); res.status(204).send(); });

    orders = asyncHandler(async (req: Request, res: Response) => res.json({ data: { orders: await this.service.listOrders(req.user!.id, Number(req.query.page), Number(req.query.limit)) } }));

    order = asyncHandler(async (req: Request, res: Response) => res.json({ data: { order: await this.service.getOrder(req.user!.id, req.params.id) } }));

    status = asyncHandler(async (req: Request, res: Response) => res.json({ data: { order: await this.service.updateOrderStatus(req.user!.id, req.params.id, req.body.status) } }));

    feedback = asyncHandler(async (req: Request, res: Response) => res.json({ data: { feedback: await this.service.feedback(req.user!.id) } }));

    stats = asyncHandler(async (req: Request, res: Response) => res.json({ data: { stats: await this.service.stats(req.user!.id) } }));
}

export const sellerController = new SellerController(sellerService);
