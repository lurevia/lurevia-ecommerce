import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sellerContractsService, type SellerContractsService } from "../services/seller-contracts.service";
import { sendSuccess } from "../../../utils/apiResponse";
import type { ListSellerContractsQuery } from "../dto";

export class SellerContractsController {
    constructor(
        private readonly service: SellerContractsService
    ) { }

    listMine = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listMine(
            req.user!.id,
            req.query as unknown as ListSellerContractsQuery
        );
        sendSuccess(res, result);
    });

    getActive = asyncHandler(async (req: Request, res: Response) => {
        const contract = await this.service.getActive(req.user!.id);
        sendSuccess(res, { contract });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const contract = await this.service.getById(
            req.user!.id,
            req.params.id
        );
        sendSuccess(res, { contract });
    });
}

export const sellerContractsController = new SellerContractsController(sellerContractsService);
