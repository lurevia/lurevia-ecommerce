import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { financialService } from "./financial.service";
import { sendSuccess, sendCreated } from "../../utils/apiResponse";
import type {
  ContractListQuery,
  FinancialListQuery,
} from "./financial.validators";

export const financialController = {
  // ─── Contrats ───
  contracts: asyncHandler(async (req: Request, res: Response) => {
    const result = await financialService.listContracts(
      req.query as unknown as ContractListQuery
    );
    sendSuccess(res, result);
  }),

  createContract: asyncHandler(async (req: Request, res: Response) => {
    const contract = await financialService.createContract(
      req.user!.id,
      req.body
    );
    sendCreated(res, { contract });
  }),

  reviewContract: asyncHandler(async (req: Request, res: Response) => {
    const contract = await financialService.reviewContract(
      req.params.id,
      req.body,
      req.user!.id
    );
    sendSuccess(res, { contract });
  }),

  // ─── Settlements ───
  settlements: asyncHandler(async (req: Request, res: Response) => {
    const result = await financialService.listSettlements(
      req.query as unknown as FinancialListQuery
    );
    sendSuccess(res, result);
  }),

  // ─── Commissions ───
  commissions: asyncHandler(async (req: Request, res: Response) => {
    const result = await financialService.listCommissions(
      req.query as unknown as FinancialListQuery
    );
    sendSuccess(res, result);
  }),

  // ─── Transferts ───
  transfers: asyncHandler(async (req: Request, res: Response) => {
    const result = await financialService.listTransfers(
      req.query as unknown as FinancialListQuery
    );
    sendSuccess(res, result);
  }),

  createTransfer: asyncHandler(async (req: Request, res: Response) => {
    const transfer = await financialService.createTransfer(
      req.params.id,
      req.body.idempotencyKey,
      req.user!.id
    );
    sendCreated(res, { transfer });
  }),

  // ─── Stats ───
  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await financialService.stats();
    sendSuccess(res, { stats });
  }),
};