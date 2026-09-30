import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { settlementsService } from "./settlements.service";
import { sendSuccess } from "../../utils/apiResponse";
import type { ListSettlementsQuery } from "./settlements.validators";

export const settlementsController = {
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const result = await settlementsService.listMine(
      req.user!.id,
      req.query as unknown as ListSettlementsQuery
    );
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const settlement = await settlementsService.getById(
      req.user!.id,
      req.params.id
    );
    sendSuccess(res, { settlement });
  }),

  getSummary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await settlementsService.getSummary(req.user!.id);
    sendSuccess(res, { summary });
  }),
};