/**
 * Module messages — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as messagesRouter } from "./routes/messages.routes";

export { messagesService } from "./services/messages.service";
export type { MessagesService } from "./services/messages.service";
