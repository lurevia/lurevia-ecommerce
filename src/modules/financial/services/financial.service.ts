import { financialRepository, type FinancialRepository } from "../repository/financial.repository";
import { financialContractsService, type FinancialContractsService } from "./contracts.service";
import { financialSettlementsService, type FinancialSettlementsService } from "./settlements.service";

export class FinancialService {
    constructor(
        private readonly financialRepository: FinancialRepository,
        private readonly financialContractsService: FinancialContractsService,
        private readonly financialSettlementsService: FinancialSettlementsService
    ) { }

    // ─── Contrats ───
    listContracts(...args: Parameters<FinancialContractsService["listContracts"]>) {
        return this.financialContractsService.listContracts(...args);
    }

    createContract(...args: Parameters<FinancialContractsService["createContract"]>) {
        return this.financialContractsService.createContract(...args);
    }

    reviewContract(...args: Parameters<FinancialContractsService["reviewContract"]>) {
        return this.financialContractsService.reviewContract(...args);
    }

    // ─── Règlements & Commissions ───
    listSettlements(...args: Parameters<FinancialSettlementsService["listSettlements"]>) {
        return this.financialSettlementsService.listSettlements(...args);
    }

    listCommissions(...args: Parameters<FinancialSettlementsService["listCommissions"]>) {
        return this.financialSettlementsService.listCommissions(...args);
    }

    // ─── Transferts ───
    listTransfers(...args: Parameters<FinancialSettlementsService["listTransfers"]>) {
        return this.financialSettlementsService.listTransfers(...args);
    }

    createTransfer(...args: Parameters<FinancialSettlementsService["createTransfer"]>) {
        return this.financialSettlementsService.createTransfer(...args);
    }

    // ─── Stats ───
    stats() {
        return this.financialRepository.stats();
    }
}

export const financialService = new FinancialService(financialRepository, financialContractsService, financialSettlementsService);
