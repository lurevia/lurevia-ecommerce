import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { favoritesService } from "./favorites.service";
import { sendSuccess } from "../../utils/apiResponse";
import type { ListFavoritesQuery } from "./favorites.validators";

export const favoritesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as ListFavoritesQuery;
    const result = await favoritesService.list(req.user!.id, page, limit);
    sendSuccess(res, result);
  }),

  toggle: asyncHandler(async (req: Request, res: Response) => {
    const result = await favoritesService.toggle(
      req.user!.id,
      req.params.productId
    );
    sendSuccess(res, result);
  }),
};