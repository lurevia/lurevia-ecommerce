import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { categoriesService } from "./categories.service";

export const categoriesController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoriesService.list();
    res.status(200).json({ data: { categories } });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.getBySlug(req.params.slug);
    res.status(200).json({ data: { category } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.create(req.body);
    res.status(201).json({ data: { category } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.update(req.params.id, req.body);
    res.status(200).json({ data: { category } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoriesService.remove(req.params.id);
    res.status(204).send();
  }),
};
