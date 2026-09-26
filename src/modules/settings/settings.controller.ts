import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getPublicSettings, getSettings, updateSettings } from "./settings.service";
import { updateSettingsSchema } from "./settings.validators";

export const settingsController = {
    get: asyncHandler(async (_req: Request, res: Response) => {
        const settings = await getSettings();
        res.json({ data: settings });
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        const payload = updateSettingsSchema.parse(req.body);
        const settings = await updateSettings(payload, req.user?.id);
        res.json({ data: settings });
    }),

    getPublic: asyncHandler(async (_req: Request, res: Response) => {
        const settings = await getPublicSettings();
        res.json({ data: settings });
    }),
};