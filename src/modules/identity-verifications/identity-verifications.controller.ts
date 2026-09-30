import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { identityVerificationsService } from "./identity-verifications.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";
import type { ListMyVerificationsQuery } from "./identity-verifications.validators";

export const identityVerificationsController = {
  submit: asyncHandler(async (req: Request, res: Response) => {
    const verification = await identityVerificationsService.submit(
      req.user!.id,
      req.body
    );
    sendCreated(res, { verification });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const result = await identityVerificationsService.listMine(
      req.user!.id,
      req.query as unknown as ListMyVerificationsQuery
    );
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const verification = await identityVerificationsService.getById(
      req.user!.id,
      req.params.id
    );
    sendSuccess(res, { verification });
  }),

  getStatus: asyncHandler(async (req: Request, res: Response) => {
    const status = await identityVerificationsService.getStatus(req.user!.id);
    sendSuccess(res, status);
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    await identityVerificationsService.cancel(req.user!.id, req.params.id);
    sendNoContent(res);
  }),
};