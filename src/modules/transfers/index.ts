/**
 * Module transfers — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as transfersRouter } from "./routes/transfers.routes";

export { transfersService } from "./services/transfers.service";
export type { TransfersService } from "./services/transfers.service";
