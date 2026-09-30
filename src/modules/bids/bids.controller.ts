import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { bidsService } from "./bids.service";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import type { ListProductBidsQuery } from "./bids.validators";

export const bidsController = {
  createBid: asyncHandler(async (req: Request, res: Response) => {
    const result = await bidsService.placeBid(req.user!.id, req.body);
    sendCreated(res, result);
  }),

  getMyBids: asyncHandler(async (req: Request, res: Response) => {
    const bids = await bidsService.getUserBids(req.user!.id);
    sendSuccess(res, { bids });
  }),

  getProductBids: asyncHandler(async (req: Request, res: Response) => {
    const result = await bidsService.getProductBids(
      req.params.productId,
      req.query as ListProductBidsQuery
    );
    sendSuccess(res, result);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const bid = await bidsService.updateBidStatus(
      req.params.id,
      req.body.status,
      req.user!.id
    );
    sendSuccess(res, { bid });
  }),
};