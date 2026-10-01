/**
 * Module admin — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as adminRouter } from "./routes/admin.routes";

export { adminService } from "./services/admin.service";
export type { AdminService } from "./services/admin.service";
