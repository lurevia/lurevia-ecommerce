/**
 * Module orders — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as ordersRouter } from "./routes/orders.routes";

export { ordersService } from "./services/orders.service";
export type { OrdersService } from "./services/orders.service";
