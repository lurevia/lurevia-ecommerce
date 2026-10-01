import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ordersService, type OrdersService } from "../services/orders.service";
import { sendSuccess, sendCreated } from "../../../utils/apiResponse";
import type { ListOrdersQuery } from "../dto";

export class OrdersController {
    constructor(
        private readonly service: OrdersService
    ) { }

    checkout = asyncHandler(async (req: Request, res: Response) => {
        const order = await this.service.checkout(req.user!.id, req.body);
        sendCreated(res, { order });
    });

    list = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit } = req.query as unknown as ListOrdersQuery;
        const result = await this.service.list(req.user!.id, page, limit);
        sendSuccess(res, result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const order = await this.service.getById(req.user!.id, req.params.id);
        sendSuccess(res, { order });
    });

    cancel = asyncHandler(async (req: Request, res: Response) => {
        const order = await this.service.cancel(req.user!.id, req.params.id);
        sendSuccess(res, { order });
    });

    adminUpdateStatus = asyncHandler(async (req: Request, res: Response) => {
        const order = await this.service.adminUpdateStatus(
            req.params.id,
            req.body.status
        );
        sendSuccess(res, { order });
    });
}

export const ordersController = new OrdersController(ordersService);
