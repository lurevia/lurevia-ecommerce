import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { categoriesService } from "./categories.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/apiResponse";

export const categoriesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoriesService.list();
    sendSuccess(res, { categories });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.getBySlug(req.params.slug);
    sendSuccess(res, { category });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.getById(req.params.id);
    sendSuccess(res, { category });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.create(req.body);
    sendCreated(res, { category });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.update(req.params.id, req.body);
    sendSuccess(res, { category });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoriesService.remove(req.params.id);
    sendNoContent(res);
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoriesService.reorder(req.body);
    sendSuccess(res, { categories });
  }),
};