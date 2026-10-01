/**
 * Module users — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as usersRouter } from "./routes/users.routes";

export { usersService } from "./services/users.service";
export type { UsersService } from "./services/users.service";
