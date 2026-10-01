import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { shippingZonesService, type ShippingZonesService } from "../services/shipping-zones.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";
import type { ListZonesQuery } from "../dto";

export class ShippingZonesController {
    constructor(
        private readonly service: ShippingZonesService
    ) { }

    // ─── Public ───
    listPublic = asyncHandler(async (_req: Request, res: Response) => {
        const zones = await this.service.listPublic();
        sendSuccess(res, { zones });
    });

    // ─── Admin ───
    list = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.list(
            req.query as unknown as ListZonesQuery
        );
        sendSuccess(res, result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const zone = await this.service.getById(req.params.id);
        sendSuccess(res, { zone });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const zone = await this.service.create(req.body);
        sendCreated(res, { zone });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const zone = await this.service.update(
            req.params.id,
            req.body
        );
        sendSuccess(res, { zone });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        await this.service.remove(req.params.id);
        sendNoContent(res);
    });
}

export const shippingZonesController = new ShippingZonesController(shippingZonesService);
