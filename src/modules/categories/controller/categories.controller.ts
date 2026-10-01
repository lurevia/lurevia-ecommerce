import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { categoriesService, type CategoriesService } from "../services/categories.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";

export class CategoriesController {
    constructor(
        private readonly service: CategoriesService
    ) { }

    list = asyncHandler(async (_req: Request, res: Response) => {
        const categories = await this.service.list();
        sendSuccess(res, { categories });
    });

    getBySlug = asyncHandler(async (req: Request, res: Response) => {
        const category = await this.service.getBySlug(req.params.slug);
        sendSuccess(res, { category });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const category = await this.service.getById(req.params.id);
        sendSuccess(res, { category });
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const category = await this.service.create(req.body);
        sendCreated(res, { category });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const category = await this.service.update(req.params.id, req.body);
        sendSuccess(res, { category });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        await this.service.remove(req.params.id);
        sendNoContent(res);
    });

    reorder = asyncHandler(async (req: Request, res: Response) => {
        const categories = await this.service.reorder(req.body);
        sendSuccess(res, { categories });
    });
}

export const categoriesController = new CategoriesController(categoriesService);
