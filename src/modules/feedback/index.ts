/**
 * Module feedback — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as feedbackRouter } from "./routes/feedback.routes";

export { feedbackService } from "./services/feedback.service";
export type { FeedbackService } from "./services/feedback.service";
