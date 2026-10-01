/**
 * Module identity-verifications — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as identityVerificationsRouter } from "./routes/identity-verifications.routes";

export { identityVerificationsService } from "./services/identity-verifications.service";
export type { IdentityVerificationsService } from "./services/identity-verifications.service";
