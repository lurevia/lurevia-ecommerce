/**
 * Module payments — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as paymentsRouter } from "./routes/payments.routes";

export { paymentsService } from "./services/payments.service";
export type { PaymentsService } from "./services/payments.service";
