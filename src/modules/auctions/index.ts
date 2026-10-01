/**
 * Module auctions — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as auctionsRouter } from "./routes/auctions.routes";

export { auctionsService } from "./services/auctions.service";
export type { AuctionsService } from "./services/auctions.service";

export { setupAuctionSocket } from "./socket/auctions.socket";
export { closeExpiredAuctions } from "./cron/auctions.cron";
