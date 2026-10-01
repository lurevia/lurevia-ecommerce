import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { identityVerificationsService, type IdentityVerificationsService } from "../services/identity-verifications.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";
import type { ListMyVerificationsQuery } from "../dto";

export class IdentityVerificationsController {
    constructor(
        private readonly service: IdentityVerificationsService
    ) { }

    submit = asyncHandler(async (req: Request, res: Response) => {
        const verification = await this.service.submit(
            req.user!.id,
            req.body
        );
        sendCreated(res, { verification });
    });

    listMine = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listMine(
            req.user!.id,
            req.query as unknown as ListMyVerificationsQuery
        );
        sendSuccess(res, result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const verification = await this.service.getById(
            req.user!.id,
            req.params.id
        );
        sendSuccess(res, { verification });
    });

    getStatus = asyncHandler(async (req: Request, res: Response) => {
        const status = await this.service.getStatus(req.user!.id);
        sendSuccess(res, status);
    });

    cancel = asyncHandler(async (req: Request, res: Response) => {
        await this.service.cancel(req.user!.id, req.params.id);
        sendNoContent(res);
    });
}

export const identityVerificationsController = new IdentityVerificationsController(identityVerificationsService);
