import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sellerContractsService } from "./seller-contracts.service";
import { sendSuccess } from "../../utils/apiResponse";
import type { ListSellerContractsQuery } from "./seller-contracts.validators";

export const sellerContractsController = {
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const result = await sellerContractsService.listMine(
      req.user!.id,
      req.query as unknown as ListSellerContractsQuery
    );
    sendSuccess(res, result);
  }),

  getActive: asyncHandler(async (req: Request, res: Response) => {
    const contract = await sellerContractsService.getActive(req.user!.id);
    sendSuccess(res, { contract });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const contract = await sellerContractsService.getById(
      req.user!.id,
      req.params.id
    );
    sendSuccess(res, { contract });
  }),
};