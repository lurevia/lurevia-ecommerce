import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { favoritesService, type FavoritesService } from "../services/favorites.service";
import { sendSuccess } from "../../../utils/apiResponse";
import type { ListFavoritesQuery } from "../dto";

export class FavoritesController {
    constructor(
        private readonly service: FavoritesService
    ) { }

    list = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as ListFavoritesQuery;
        const result = await this.service.list(req.user!.id, page, limit);
        sendSuccess(res, result);
    });

    toggle = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.toggle(
            req.user!.id,
            req.params.productId
        );
        sendSuccess(res, result);
    });
}

export const favoritesController = new FavoritesController(favoritesService);
