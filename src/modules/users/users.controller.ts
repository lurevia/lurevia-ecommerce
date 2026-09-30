import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { usersService } from "./users.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";

export const usersController = {
  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const result = await usersService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, result);
  }),

  completeOAuthProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.completeOAuthProfile(
      req.user!.id,
      req.body
    );
    sendSuccess(res, { user });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await usersService.changePassword(req.user!.id, req.body);
    sendNoContent(res);
  }),

  requestDeletion: asyncHandler(async (req: Request, res: Response) => {
    const request = await usersService.requestDeletion(
      req.user!.id,
      req.body
    );
    sendCreated(res, { request });
  }),
};