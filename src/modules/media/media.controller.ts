import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { mediaService } from "./media.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";
import type { ListMediaQuery } from "./media.validators";

export const mediaController = {
  import: asyncHandler(async (req: Request, res: Response) => {
    const media = await mediaService.importFromUrl(
      req.user!.id,
      req.body.url
    );
    sendCreated(res, { media });
  }),

  upload: asyncHandler(async (req: Request, res: Response) => {
    const media = await mediaService.uploadDataUrl(
      req.user!.id,
      req.body.dataUrl
    );
    sendCreated(res, { media });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ListMediaQuery;
    const result = await mediaService.list(req.user!.id, page, limit);
    sendSuccess(res, result);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await mediaService.remove(req.params.id, req.user!.id);
    sendNoContent(res);
  }),
};