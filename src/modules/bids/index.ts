/**
 * Module bids — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as bidsRouter } from "./routes/bids.routes";

export { bidsService } from "./services/bids.service";
export type { BidsService } from "./services/bids.service";

export type { BidDto } from "./dto";
