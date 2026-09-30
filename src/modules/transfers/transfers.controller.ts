import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { transfersService } from "./transfers.service";
import { sendSuccess } from "../../utils/apiResponse";
import type { ListTransfersQuery } from "./transfers.validators";

export const transfersController = {
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const result = await transfersService.listMine(
      req.user!.id,
      req.query as unknown as ListTransfersQuery
    );
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const transfer = await transfersService.getById(
      req.user!.id,
      req.params.id
    );
    sendSuccess(res, { transfer });
  }),

  getSummary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await transfersService.getSummary(req.user!.id);
    sendSuccess(res, { summary });
  }),
};