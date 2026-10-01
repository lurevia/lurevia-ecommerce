/**
 * Module seller-contracts — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as sellerContractsRouter } from "./routes/seller-contracts.routes";

export { sellerContractsService } from "./services/seller-contracts.service";
export type { SellerContractsService } from "./services/seller-contracts.service";
