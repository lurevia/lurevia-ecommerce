import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { productsService } from "./products.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";
import type {
  ListProductsQuery,
  SearchSuggestionsQuery,
} from "./products.validators";

export const productsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await productsService.list(
      req.query as unknown as ListProductsQuery
    );
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.getById(req.params.id);
    sendSuccess(res, { product });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.getBySlug(req.params.slug);
    sendSuccess(res, { product });
  }),

  getRelated: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    const products = await productsService.getRelated(req.params.id, limit);
    sendSuccess(res, { products });
  }),

  searchSuggestions: asyncHandler(async (req: Request, res: Response) => {
    const { q, limit } = req.query as unknown as SearchSuggestionsQuery;
    const suggestions = await productsService.searchSuggestions(q, limit);
    sendSuccess(res, { suggestions });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as {
      page?: number;
      limit?: number;
    };
    const result = await productsService.listMine(req.user!.id, page, limit);
    sendSuccess(res, result);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.create(req.body, req.user!.id);
    sendCreated(res, { product });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.update(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
    );
    sendSuccess(res, { product });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await productsService.remove(req.params.id, req.user!.id, req.user!.role);
    sendNoContent(res);
  }),
};