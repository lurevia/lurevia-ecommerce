/**
 * Module auth — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as authRouter } from "./routes/auth.routes";

export { authService } from "./services/auth.service";
export type { AuthService } from "./services/auth.service";
