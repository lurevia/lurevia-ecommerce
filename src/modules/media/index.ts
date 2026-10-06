/**
 * Module media — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as mediaRouter } from "./routes/media.routes";
export type { StoredMedia } from "./lib/types";
export { mediaService } from "./services/media.service";
export type { MediaService } from "./services/media.service";
