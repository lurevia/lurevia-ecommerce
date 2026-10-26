import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendCreated, sendSuccess } from "../../../utils/apiResponse";
import { sitePagesService } from "../services/site-pages.service";

export class SitePagesController {
  listPublished = asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await sitePagesService.listPublished());
  });

  getPublished = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await sitePagesService.getPublished(req.params.slug));
  });

  listAdmin = asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await sitePagesService.listAdmin());
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const page = await sitePagesService.create(
      req.body,
      req.user!.id
    );
    sendCreated(res, page);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const page = await sitePagesService.update(
      req.params.id,
      req.body,
      req.user!.id
    );
    sendSuccess(res, page);
  });

  syncDoc = asyncHandler(async (req: Request, res: Response) => {
    const page = await sitePagesService.syncDoc(req.params.id, req.user!.id);
    sendSuccess(res, page);
  });

  fetchDoc = asyncHandler(async (req: Request, res: Response) => {
    const result = await sitePagesService.fetchGoogleDoc(req.body.url);
    sendSuccess(res, result);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await sitePagesService.remove(req.params.id, req.user!.id)
    );
  });
}

export const sitePagesController = new SitePagesController();
