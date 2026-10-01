/**
 * Module newsletter — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as newsletterRouter } from "./routes/newsletter.routes";

export { newsletterService } from "./services/newsletter.service";
export type { NewsletterService } from "./services/newsletter.service";
