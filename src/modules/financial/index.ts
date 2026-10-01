/**
 * Module financial — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { financialService } from "./services/financial.service";
export type { FinancialService } from "./services/financial.service";
