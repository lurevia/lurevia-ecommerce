import { Router } from "express";
import { reviewsController } from "../controller/reviews.controller";
import { attachUserIfPresent, requireAuth, requireVerified } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { cinRateLimiter } from "../../../middlewares/rateLimit.middleware";
import { createReviewSchema, listReviewsQuerySchema, productIdParamsSchema, reviewIdParamsSchema, updateReviewSchema } from "../dto";

// ═══════════════════════════════════════════════════════════════════════════
// Router 1 : /products/:productId/reviews
// ═══════════════════════════════════════════════════════════════════════════
export const productReviewsRouter = Router({ mergeParams: true });

productReviewsRouter.get(
    "/",
    validate({ params: productIdParamsSchema, query: listReviewsQuerySchema }),
    reviewsController.listForProduct
);

productReviewsRouter.get(
    "/rating",
    validate({ params: productIdParamsSchema }),
    reviewsController.getRating
);

productReviewsRouter.get(
    "/eligibility",
    attachUserIfPresent,
    validate({ params: productIdParamsSchema }),
    reviewsController.getEligibility
);

productReviewsRouter.get(
    "/me",
    requireAuth,
    validate({ params: productIdParamsSchema }),
    reviewsController.getMine
);

productReviewsRouter.post(
    "/",
    requireAuth,
    requireVerified,
    cinRateLimiter,
    validate({ params: productIdParamsSchema, body: createReviewSchema }),
    reviewsController.create
);

// ═══════════════════════════════════════════════════════════════════════════
// Router 2 : /reviews
// ═══════════════════════════════════════════════════════════════════════════
export const reviewsRouter = Router();

reviewsRouter.use(requireAuth, requireVerified);

reviewsRouter.patch(
    "/:id",
    validate({ params: reviewIdParamsSchema, body: updateReviewSchema }),
    reviewsController.update
);

reviewsRouter.delete(
    "/:id",
    validate({ params: reviewIdParamsSchema }),
    reviewsController.remove
);
