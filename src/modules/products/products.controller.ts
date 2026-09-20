import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { productsService } from "./products.service";

export const productsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await productsService.list(req.query as unknown as Parameters<typeof productsService.list>[0]);
    res.status(200).json({ data: result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.getById(req.params.id);
    res.status(200).json({ data: { product } });
  }),

  getRelated: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    const products = await productsService.getRelated(req.params.id, limit);
    res.status(200).json({ data: { products } });
  }),

  searchSuggestions: asyncHandler(async (req: Request, res: Response) => {
    const { q, limit } = req.query as unknown as { q: string; limit: number };
    const suggestions = await productsService.searchSuggestions(q, limit);
    res.status(200).json({ data: { suggestions } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.create(req.body);
    res.status(201).json({ data: { product } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.update(req.params.id, req.body);
    res.status(200).json({ data: { product } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await productsService.remove(req.params.id);
    res.status(204).send();
  }),
};
