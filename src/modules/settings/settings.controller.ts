import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  getPublicSettings,
  getSettings,
  updateSettings,
} from "./settings.service";
import { sendSuccess } from "../../utils/apiResponse";

export const settingsController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await getSettings();
    sendSuccess(res, settings);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const settings = await updateSettings(req.body, req.user?.id);
    sendSuccess(res, settings);
  }),

  getPublic: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await getPublicSettings();
    sendSuccess(res, settings);
  }),
};