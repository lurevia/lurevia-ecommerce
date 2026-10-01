import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { bidsService, type BidsService } from "../services/bids.service";
import { sendSuccess, sendCreated } from "../../../utils/apiResponse";
import type { ListProductBidsQuery } from "../dto";

export class BidsController {
    constructor(
        private readonly service: BidsService
    ) { }

    createBid = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.placeBid(req.user!.id, req.body);
        sendCreated(res, result);
    });

    getMyBids = asyncHandler(async (req: Request, res: Response) => {
        const bids = await this.service.getUserBids(req.user!.id);
        sendSuccess(res, { bids });
    });

    getProductBids = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.getProductBids(
            req.params.productId,
            req.query as ListProductBidsQuery
        );
        sendSuccess(res, result);
    });

    updateStatus = asyncHandler(async (req: Request, res: Response) => {
        const bid = await this.service.updateBidStatus(
            req.params.id,
            req.body.status,
            req.user!.id
        );
        sendSuccess(res, { bid });
    });
}

export const bidsController = new BidsController(bidsService);
