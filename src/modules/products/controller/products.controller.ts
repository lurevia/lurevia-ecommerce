import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { productsService, type ProductsService } from "../services/products.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";
import type { ListProductsQuery, SearchSuggestionsQuery } from "../dto";

export class ProductsController {
    constructor(
        private readonly service: ProductsService
    ) { }

    list = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.list(
            req.query as unknown as ListProductsQuery
        );
        sendSuccess(res, result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const product = await this.service.getById(req.params.id);
        sendSuccess(res, { product });
    });

    getBySlug = asyncHandler(async (req: Request, res: Response) => {
        const product = await this.service.getBySlug(req.params.slug);
        sendSuccess(res, { product });
    });

    getRelated = asyncHandler(async (req: Request, res: Response) => {
        const limit = req.query.limit ? Number(req.query.limit) : 4;
        const products = await this.service.getRelated(req.params.id, limit);
        sendSuccess(res, { products });
    });

    searchSuggestions = asyncHandler(async (req: Request, res: Response) => {
        const { q, limit } = req.query as unknown as SearchSuggestionsQuery;
        const suggestions = await this.service.searchSuggestions(q, limit);
        sendSuccess(res, { suggestions });
    });

    listMine = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as {
            page?: number;
            limit?: number;
        };
        const result = await this.service.listMine(req.user!.id, page, limit);
        sendSuccess(res, result);
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const product = await this.service.create(req.body, req.user!.id);
        sendCreated(res, { product });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const product = await this.service.update(
            req.params.id,
            req.body,
            req.user!.id,
            req.user!.role
        );
        sendSuccess(res, { product });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        await this.service.remove(req.params.id, req.user!.id, req.user!.role);
        sendNoContent(res);
    });
}

export const productsController = new ProductsController(productsService);
