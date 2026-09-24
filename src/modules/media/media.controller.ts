import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { mediaService } from "./media.service";

export const mediaController = {
  import: asyncHandler(async (req: Request, res: Response) => {
    const media = await mediaService.importFromUrl(req.user!.id, req.body.url);
    res.status(201).json({ data: { media } });
  }),
};
