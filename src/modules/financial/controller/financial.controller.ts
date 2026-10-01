import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { financialService, type FinancialService } from "../services/financial.service";
import { sendSuccess, sendCreated } from "../../../utils/apiResponse";
import type { ContractListQuery, FinancialListQuery } from "../dto";

export class FinancialController {
    constructor(
        private readonly service: FinancialService
    ) { }

    // ─── Contrats ───
    contracts = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listContracts(
            req.query as unknown as ContractListQuery
        );
        sendSuccess(res, result);
    });

    createContract = asyncHandler(async (req: Request, res: Response) => {
        const contract = await this.service.createContract(
            req.user!.id,
            req.body
        );
        sendCreated(res, { contract });
    });

    reviewContract = asyncHandler(async (req: Request, res: Response) => {
        const contract = await this.service.reviewContract(
            req.params.id,
            req.body,
            req.user!.id
        );
        sendSuccess(res, { contract });
    });

    // ─── Settlements ───
    settlements = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listSettlements(
            req.query as unknown as FinancialListQuery
        );
        sendSuccess(res, result);
    });

    // ─── Commissions ───
    commissions = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listCommissions(
            req.query as unknown as FinancialListQuery
        );
        sendSuccess(res, result);
    });

    // ─── Transferts ───
    transfers = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.service.listTransfers(
            req.query as unknown as FinancialListQuery
        );
        sendSuccess(res, result);
    });

    createTransfer = asyncHandler(async (req: Request, res: Response) => {
        const transfer = await this.service.createTransfer(
            req.params.id,
            req.body.idempotencyKey,
            req.user!.id
        );
        sendCreated(res, { transfer });
    });

    // ─── Stats ───
    stats = asyncHandler(async (_req: Request, res: Response) => {
        const stats = await this.service.stats();
        sendSuccess(res, { stats });
    });
}

export const financialController = new FinancialController(financialService);
