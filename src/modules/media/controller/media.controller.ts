import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { mediaService, type MediaService } from "../services/media.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";
import type { ListMediaQuery } from "../dto";

export class MediaController {
    constructor(
        private readonly service: MediaService
    ) { }

    import = asyncHandler(async (req: Request, res: Response) => {
        const media = await this.service.importFromUrl(
            req.user!.id,
            req.body.url
        );
        sendCreated(res, { media });
    });

    upload = asyncHandler(async (req: Request, res: Response) => {
        const media = await this.service.uploadDataUrl(
            req.user!.id,
            req.body.dataUrl
        );
        sendCreated(res, { media });
    });

    list = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as ListMediaQuery;
        const result = await this.service.list(req.user!.id, page, limit);
        sendSuccess(res, result);
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        await this.service.remove(req.params.id, req.user!.id);
        sendNoContent(res);
    });
}

export const mediaController = new MediaController(mediaService);
