/**
 * Module shipping-zones — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as shippingZonesRouter } from "./routes/shipping-zones.routes";

export { shippingZonesService } from "./services/shipping-zones.service";
export type { ShippingZonesService } from "./services/shipping-zones.service";
