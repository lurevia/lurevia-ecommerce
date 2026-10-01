/**
 * Module settings — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as settingsRouter } from "./routes/settings.routes";

export { settingsService } from "./services/settings.service";
export type { SettingsService } from "./services/settings.service";
