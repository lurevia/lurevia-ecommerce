import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";
import { placesService } from "../../../services/places.service";

export class PlacesController {
    getStatus = asyncHandler(async (_req: Request, res: Response) => {
        const status = placesService.getStatus();
        sendSuccess(res, status);
    });

    search = asyncHandler(async (req: Request, res: Response) => {
        const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const location = typeof req.query.location === "string" ? req.query.location.trim() : undefined;
        const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 10;

        if (!query) {
            sendSuccess(res, []);
            return;
        }

        const results = await placesService.searchPlaces(query, { location, limit });
        sendSuccess(res, results);
    });
}

export const placesController = new PlacesController();
