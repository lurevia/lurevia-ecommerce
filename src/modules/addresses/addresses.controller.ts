import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { addressesService } from "./addresses.service";

export const addressesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressesService.list(req.user!.id);
    res.status(200).json({ data: { addresses } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const address = await addressesService.create(req.user!.id, req.body);
    res.status(201).json({ data: { address } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const address = await addressesService.update(req.user!.id, req.params.id, req.body);
    res.status(200).json({ data: { address } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await addressesService.remove(req.user!.id, req.params.id);
    res.status(204).send();
  }),

  setDefault: asyncHandler(async (req: Request, res: Response) => {
    const address = await addressesService.setDefault(req.user!.id, req.params.id);
    res.status(200).json({ data: { address } });
  }),
};
