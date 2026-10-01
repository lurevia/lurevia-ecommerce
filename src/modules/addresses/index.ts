/**
 * Module Addresses — API publique.
 *
 * Expose uniquement :
 *   - Le router (pour le router principal)
 *   - Le service (pour les autres modules qui ont besoin des adresses)
 *   - Les types publics (pour les consommateurs externes)
 *
 * Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as addressesRouter } from "./routes/addresses.routes";

export { addressesService } from "./services/addresses.service";
export type { AddressesService } from "./services/addresses.service";

export type { AddressOutput } from "./dto";
export type { AddressWithPickup } from "./lib/type";