import { financialRepository } from "./financial.repository";
import { financialContractsService } from "./services/contracts.service";
import { financialSettlementsService } from "./services/settlements.service";

export const financialService = {
  // ─── Contrats ───
  listContracts: financialContractsService.listContracts.bind(financialContractsService),
  createContract: financialContractsService.createContract.bind(financialContractsService),
  reviewContract: financialContractsService.reviewContract.bind(financialContractsService),

  // ─── Règlements & Commissions ───
  listSettlements: financialSettlementsService.listSettlements.bind(financialSettlementsService),
  listCommissions: financialSettlementsService.listCommissions.bind(financialSettlementsService),

  // ─── Transferts ───
  listTransfers: financialSettlementsService.listTransfers.bind(financialSettlementsService),
  createTransfer: financialSettlementsService.createTransfer.bind(financialSettlementsService),

  // ─── Stats ───
  stats: () => financialRepository.stats(),
};
