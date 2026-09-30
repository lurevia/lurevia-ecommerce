import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { newsletterService } from "./newsletter.service";
import {
  sendSuccess,
  sendCreated,
} from "../../utils/apiResponse";
import type { ListNewsletterQuery } from "./newsletter.validators";

export const newsletterController = {
  subscribe: asyncHandler(async (req: Request, res: Response) => {
    const result = await newsletterService.subscribe(
      req.body.email,
      req.ip
    );
    sendCreated(res, result);
  }),

  confirm: asyncHandler(async (req: Request, res: Response) => {
    const result = await newsletterService.confirm(req.body.token);
    sendSuccess(res, result);
  }),

  unsubscribe: asyncHandler(async (req: Request, res: Response) => {
    const result = await newsletterService.unsubscribe(
      req.body.email,
      req.body.reason
    );
    sendSuccess(res, result);
  }),

  // ─── Admin ───
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ListNewsletterQuery;
    const result = await newsletterService.list(page, limit);
    sendSuccess(res, result);
  }),
};