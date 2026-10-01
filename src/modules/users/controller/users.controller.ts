import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { usersService, type UsersService } from "../services/users.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";

export class UsersController {
    constructor(
        private readonly service: UsersService
    ) { }

    updateMe = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.updateProfile(req.user!.id, req.body);
        sendSuccess(res, result);
    });

    completeOAuthProfile = asyncHandler(async (req: Request, res: Response) => {
        const user = await this.service.completeOAuthProfile(
            req.user!.id,
            req.body
        );
        sendSuccess(res, { user });
    });

    changePassword = asyncHandler(async (req: Request, res: Response) => {
        await this.service.changePassword(req.user!.id, req.body);
        sendNoContent(res);
    });

    requestDeletion = asyncHandler(async (req: Request, res: Response) => {
        const request = await this.service.requestDeletion(
            req.user!.id,
            req.body
        );
        sendCreated(res, { request });
    });
}

export const usersController = new UsersController(usersService);
