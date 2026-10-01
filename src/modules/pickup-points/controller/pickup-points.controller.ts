import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { pickupPointsService, type PickupPointsService } from "../services/pickup-points.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";
import type { ListPickupPointsQuery } from "../dto";
import type { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";

export class PickupPointsController {
    constructor(
        private readonly service: PickupPointsService
    ) { }

    // ─── Public ───
    listPublic = asyncHandler(async (req: Request, res: Response) => {
        const { province, region, city } = req.query as {
            province?: ProvinceMadagascar;
            region?: RegionMadagascar;
            city?: string;
        };
        const pickupPoints = await this.service.listPublic({
            province,
            region,
            city,
        });
        sendSuccess(res, { pickupPoints });
    });

    listByRegion = asyncHandler(async (req: Request, res: Response) => {
        const { region } = req.query as { region: RegionMadagascar; };
        const pickupPoints = await this.service.listByRegion(region);
        sendSuccess(res, { pickupPoints });
    });

    // ─── Admin ───
    list = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.list(
            req.query as unknown as ListPickupPointsQuery
        );
        sendSuccess(res, result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const pickupPoint = await this.service.getById(req.params.id);
        sendSuccess(res, { pickupPoint });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const pickupPoint = await this.service.create(req.body);
        sendCreated(res, { pickupPoint });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const pickupPoint = await this.service.update(
            req.params.id,
            req.body
        );
        sendSuccess(res, { pickupPoint });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        await this.service.remove(req.params.id);
        sendNoContent(res);
    });
}

export const pickupPointsController = new PickupPointsController(pickupPointsService);
