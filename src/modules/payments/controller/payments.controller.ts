import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { paymentsService, type PaymentsService } from "../services/payments.service";
import { sendSuccess, sendCreated } from "../../../utils/apiResponse";
import type { ListTransactionsQuery } from "../dto";
import type { MobileMoneyProvider } from "@prisma/client";

export class PaymentsController {
    constructor(
        private readonly service: PaymentsService
    ) { }

    // ─── Client ───
    initiate = asyncHandler(async (req: Request, res: Response) => {
        const transaction = await this.service.initiate(req.user!.id, req.body);
        sendCreated(res, { transaction });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const transaction = await this.service.getById(
            req.user!.id,
            req.params.transactionId
        );
        sendSuccess(res, { transaction });
    });

    listMine = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listMine(
            req.user!.id,
            req.query as unknown as ListTransactionsQuery
        );
        sendSuccess(res, result);
    });

    // ─── Webhook (public, signé) ───
    webhook = asyncHandler(async (req: Request, res: Response) => {
        const provider = req.params.provider as MobileMoneyProvider;
        const signature = req.headers["x-signature"] as string | undefined;

        const result = await this.service.handleWebhook(
            provider,
            req.body,
            signature
        );

        // Toujours répondre 200 pour éviter les re-tentatives en boucle
        res.status(200).json({ data: result });
    });

    // ─── Admin ───
    refund = asyncHandler(async (req: Request, res: Response) => {
        const transaction = await this.service.refund(
            req.params.transactionId,
            req.body
        );
        sendSuccess(res, { transaction });
    });
}

export const paymentsController = new PaymentsController(paymentsService);
