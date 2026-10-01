import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { settlementsService, type SettlementsService } from "../services/settlements.service";
import { sendSuccess } from "../../../utils/apiResponse";
import type { ListSettlementsQuery } from "../dto";

export class SettlementsController {
    constructor(
        private readonly service: SettlementsService
    ) { }

    listMine = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listMine(
            req.user!.id,
            req.query as unknown as ListSettlementsQuery
        );
        sendSuccess(res, result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const settlement = await this.service.getById(
            req.user!.id,
            req.params.id
        );
        sendSuccess(res, { settlement });
    });

    getSummary = asyncHandler(async (req: Request, res: Response) => {
        const summary = await this.service.getSummary(req.user!.id);
        sendSuccess(res, { summary });
    });
}

export const settlementsController = new SettlementsController(settlementsService);
