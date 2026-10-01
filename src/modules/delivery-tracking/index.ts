/**
 * Module delivery-tracking — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as deliveryTrackingRouter } from "./routes/delivery-tracking.routes";

export { deliveryTrackingService } from "./services/delivery-tracking.service";
export type { DeliveryTrackingService } from "./services/delivery-tracking.service";
