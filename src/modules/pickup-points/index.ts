/**
 * Module pickup-points — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as pickupPointsRouter } from "./routes/pickup-points.routes";

export { pickupPointsService } from "./services/pickup-points.service";
export type { PickupPointsService } from "./services/pickup-points.service";
