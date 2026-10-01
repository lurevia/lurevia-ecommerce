/**
 * Module products — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as productsRouter } from "./routes/products.routes";

export { productsService } from "./services/products.service";
export type { ProductsService } from "./services/products.service";

export type { ProductDto } from "./dto";
