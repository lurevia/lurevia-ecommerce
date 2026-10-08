import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sellerService, type SellerService } from "../services/seller.service";
import { sendSuccess } from "../../../utils/apiResponse";
import { publicSellerListSchema } from "../dto";

export class SellerController {
    constructor(
        private readonly service: SellerService
    ) { }

    apply = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: await this.service.apply(req.user!.id, req.body) }));

    publicProfiles = asyncHandler(async (req: Request, res: Response) => {
        const query = publicSellerListSchema.parse(req.query);
        sendSuccess(res, await this.service.listPublicProfiles(query));
    });

    publicProfile = asyncHandler(async (req: Request, res: Response) => {
        sendSuccess(res, await this.service.getPublicProfile(req.params.id));
    });

    updateProfile = asyncHandler(async (req: Request, res: Response) => {
        sendSuccess(res, { profile: await this.service.updateProfile(req.user!.id, req.body) });
    });

    myProfile = asyncHandler(async (req: Request, res: Response) => {
        sendSuccess(res, { profile: await this.service.getMyProfile(req.user!.id) });
    });

    products = asyncHandler(async (req: Request, res: Response) => res.json({ data: { products: await this.service.listProducts(req.user!.id, Number(req.query.page), Number(req.query.limit)) } }));

    createProduct = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: { product: await this.service.createProduct(req.user!.id, req.body) } }));

    updateProduct = asyncHandler(async (req: Request, res: Response) => res.json({ data: { product: await this.service.updateProduct(req.user!.id, req.params.id, req.body) } }));

    removeProduct = asyncHandler(async (req: Request, res: Response) => { await this.service.removeProduct(req.user!.id, req.params.id); res.status(204).send(); });

    requestProductDeletion = asyncHandler(async (req: Request, res: Response) => {
        const request = await this.service.requestProductDeletion(
            req.user!.id,
            req.params.id,
            req.body.reason
        );
        res.status(201).json({ data: { request } });
    });

    orders = asyncHandler(async (req: Request, res: Response) => res.json({ data: { orders: await this.service.listOrders(req.user!.id, Number(req.query.page), Number(req.query.limit)) } }));

    order = asyncHandler(async (req: Request, res: Response) => res.json({ data: { order: await this.service.getOrder(req.user!.id, req.params.id) } }));

    status = asyncHandler(async (req: Request, res: Response) => res.json({ data: { order: await this.service.updateOrderStatus(req.user!.id, req.params.id, req.body.status) } }));

    feedback = asyncHandler(async (req: Request, res: Response) => res.json({ data: { feedback: await this.service.feedback(req.user!.id) } }));

    stats = asyncHandler(async (req: Request, res: Response) => res.json({ data: { stats: await this.service.stats(req.user!.id) } }));

    subscribe = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.subscribe(req.user!.id, req.params.id);
        sendSuccess(res, result);
    });

    unsubscribe = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.unsubscribe(req.user!.id, req.params.id);
        sendSuccess(res, result);
    });

    mySubscriptions = asyncHandler(async (req: Request, res: Response) => {
        const subscriptions = await this.service.getUserSubscriptions(req.user!.id);
        sendSuccess(res, { subscriptions });
    });
}

export const sellerController = new SellerController(sellerService);
