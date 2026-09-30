import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { addressesService } from "./addresses.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/apiResponse";

export const addressesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressesService.list(req.user!.id);
    sendSuccess(res, { addresses });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const address = await addressesService.getById(
      req.user!.id,
      req.params.id
    );
    sendSuccess(res, { address });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const address = await addressesService.create(req.user!.id, req.body);
    sendCreated(res, { address });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const address = await addressesService.update(
      req.user!.id,
      req.params.id,
      req.body
    );
    sendSuccess(res, { address });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await addressesService.remove(req.user!.id, req.params.id);
    sendNoContent(res);
  }),

  setDefault: asyncHandler(async (req: Request, res: Response) => {
    const address = await addressesService.setDefault(
      req.user!.id,
      req.params.id
    );
    sendSuccess(res, { address });
  }),
};