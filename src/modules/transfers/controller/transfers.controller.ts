import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { transfersService, type TransfersService } from "../services/transfers.service";
import { sendSuccess } from "../../../utils/apiResponse";
import type { ListTransfersQuery } from "../dto";

export class TransfersController {
    constructor(
        private readonly service: TransfersService
    ) { }

    listMine = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listMine(
            req.user!.id,
            req.query as unknown as ListTransfersQuery
        );
        sendSuccess(res, result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const transfer = await this.service.getById(
            req.user!.id,
            req.params.id
        );
        sendSuccess(res, { transfer });
    });

    getSummary = asyncHandler(async (req: Request, res: Response) => {
        const summary = await this.service.getSummary(req.user!.id);
        sendSuccess(res, { summary });
    });
}

export const transfersController = new TransfersController(transfersService);
