import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { pickupPointsService } from "./pickup-points.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";
import type {
  ListPickupPointsQuery,
} from "./pickup-points.validators";
import type {
  ProvinceMadagascar,
  RegionMadagascar,
} from "@prisma/client";

export const pickupPointsController = {
  // ─── Public ───
  listPublic: asyncHandler(async (req: Request, res: Response) => {
    const { province, region, city } = req.query as {
      province?: ProvinceMadagascar;
      region?: RegionMadagascar;
      city?: string;
    };
    const pickupPoints = await pickupPointsService.listPublic({
      province,
      region,
      city,
    });
    sendSuccess(res, { pickupPoints });
  }),

  listByRegion: asyncHandler(async (req: Request, res: Response) => {
    const { region } = req.query as { region: RegionMadagascar };
    const pickupPoints = await pickupPointsService.listByRegion(region);
    sendSuccess(res, { pickupPoints });
  }),

  // ─── Admin ───
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await pickupPointsService.list(
      req.query as unknown as ListPickupPointsQuery
    );
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const pickupPoint = await pickupPointsService.getById(req.params.id);
    sendSuccess(res, { pickupPoint });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const pickupPoint = await pickupPointsService.create(req.body);
    sendCreated(res, { pickupPoint });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const pickupPoint = await pickupPointsService.update(
      req.params.id,
      req.body
    );
    sendSuccess(res, { pickupPoint });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await pickupPointsService.remove(req.params.id);
    sendNoContent(res);
  }),
};