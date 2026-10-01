import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { getPublicSettings, getSettings, updateSettings } from "../services/settings.service";
import { sendSuccess } from "../../../utils/apiResponse";

export class SettingsController {
    get = asyncHandler(async (_req: Request, res: Response) => {
        const settings = await getSettings();
        sendSuccess(res, settings);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const settings = await updateSettings(req.body, req.user?.id);
        sendSuccess(res, settings);
    });

    getPublic = asyncHandler(async (_req: Request, res: Response) => {
        const settings = await getPublicSettings();
        sendSuccess(res, settings);
    });
}

export const settingsController = new SettingsController();
