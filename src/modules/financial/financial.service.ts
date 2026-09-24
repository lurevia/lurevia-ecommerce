import { NotFoundError, ConflictError } from "../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../utils/pagination";
import { financialRepository } from "./financial.repository";

export const financialService = {
  async listContracts(query: any) {
    const p = normalizePagination(query.page, query.limit);
    const [items, total] = await financialRepository.contracts({ status: query.status, sellerId: query.sellerId }, (p.page - 1) * p.limit, p.limit);
    return buildPaginatedResult(items, total, p);
  },
  async createContract(sellerId: string, input: any) {
    return financialRepository.createContract({ ...input, sellerId, version: await financialRepository.nextVersion(sellerId) });
  },
  async reviewContract(id: string, approved: boolean, adminId: string, reason?: string) {
    const contract = await financialRepository.contract(id);
    if (!contract) throw new NotFoundError("Contrat");
    if (contract.status !== "PENDING") throw new ConflictError("Ce contrat a déjà été traité.");
    return financialRepository.reviewContract(id, approved, adminId, reason);
  },
  async listSettlements(query: any) {
    const p = normalizePagination(query.page, query.limit);
    const [items, total] = await financialRepository.settlements({ status: query.status, sellerId: query.sellerId }, (p.page - 1) * p.limit, p.limit);
    return buildPaginatedResult(items, total, p);
  },
  async listTransfers(query: any) {
    const p = normalizePagination(query.page, query.limit);
    const [items, total] = await financialRepository.transfers({ sellerId: query.sellerId, status: query.status }, (p.page - 1) * p.limit, p.limit);
    return buildPaginatedResult(items, total, p);
  },
  async createTransfer(settlementId: string, idempotencyKey: string) {
    const transfer = await financialRepository.createTransfer(settlementId, idempotencyKey);
    if (!transfer) throw new NotFoundError("Settlement");
    return transfer;
  },
  stats: () => financialRepository.stats(),
};
