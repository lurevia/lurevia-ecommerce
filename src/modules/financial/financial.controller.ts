import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { financialService } from "./financial.service";

export const financialController = {
  contracts: asyncHandler(async (req: Request, res: Response) => res.json({ data: await financialService.listContracts(req.query) })),
  createContract: asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: { contract: await financialService.createContract(req.user!.id, req.body) } })),
  reviewContract: asyncHandler(async (req: Request, res: Response) => res.json({ data: { contract: await financialService.reviewContract(req.params.id, req.body.approved, req.user!.id, req.body.reason) } })),
  settlements: asyncHandler(async (req: Request, res: Response) => res.json({ data: await financialService.listSettlements(req.query) })),
  commissions: asyncHandler(async (req: Request, res: Response) => res.json({ data: await financialService.listCommissions(req.query) })),
  transfers: asyncHandler(async (req: Request, res: Response) => res.json({ data: await financialService.listTransfers(req.query) })),
  createTransfer: asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: { transfer: await financialService.createTransfer(req.params.id, req.body.idempotencyKey) } })),
  stats: asyncHandler(async (_req: Request, res: Response) => res.json({ data: { stats: await financialService.stats() } })),
};
