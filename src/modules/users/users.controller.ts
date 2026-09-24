import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { usersService } from "./users.service";

export const usersController = {
  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.updateProfile(req.user!.id, req.body);
    res.status(200).json({ data: { user } });
  }),
  completeOAuthProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.completeOAuthProfile(req.user!.id, req.body);
    res.status(200).json({ data: { user } });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await usersService.changePassword(req.user!.id, req.body);
    res.status(204).send();
  }),

  requestDeletion: asyncHandler(async (req: Request, res: Response) => {
    const request = await usersService.requestDeletion(req.user!.id, req.body);
    res.status(201).json({ data: { request } });
  }),
};
