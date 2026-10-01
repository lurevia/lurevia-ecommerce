/**
 * Module reviews — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { productReviewsRouter } from "./routes/reviews.routes";
export { reviewsRouter } from "./routes/reviews.routes";

export { reviewsService } from "./services/reviews.service";
export type { ReviewsService } from "./services/reviews.service";
