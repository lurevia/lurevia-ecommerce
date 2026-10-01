/**
 * Module favorites — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as favoritesRouter } from "./routes/favorites.routes";

export { favoritesService } from "./services/favorites.service";
export type { FavoritesService } from "./services/favorites.service";
