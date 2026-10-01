/**
 * Module settlements — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as settlementsRouter } from "./routes/settlements.routes";

export { settlementsService } from "./services/settlements.service";
export type { SettlementsService } from "./services/settlements.service";
