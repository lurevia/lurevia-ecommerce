/**
 * Module cart — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as cartRouter } from "./routes/cart.routes";

export { cartService } from "./services/cart.service";
export type { CartService } from "./services/cart.service";
