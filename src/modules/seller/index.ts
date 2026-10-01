/**
 * Module seller — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as sellerRouter } from "./routes/seller.routes";

export { sellerService } from "./services/seller.service";
export type { SellerService } from "./services/seller.service";
