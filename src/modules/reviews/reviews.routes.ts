import { Router } from "express";
import { reviewsController } from "./reviews.controller";
import { attachUserIfPresent, requireAuth, requireVerified } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createReviewSchema,
  productIdParamsSchema,
  reviewIdParamsSchema,
  updateReviewSchema,
} from "./reviews.validators";

/** Monté sous /products/:productId/reviews */
export const productReviewsRouter = Router({ mergeParams: true });

productReviewsRouter.get(
  "/",
  validate({ params: productIdParamsSchema }),
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
  validate({ params: productIdParamsSchema, body: createReviewSchema }),
  reviewsController.create
);

/** Monté sous /reviews */
export const reviewsRouter = Router();

reviewsRouter.use(requireAuth);
reviewsRouter.patch(
  "/:id",
  requireVerified,
  validate({ params: reviewIdParamsSchema, body: updateReviewSchema }),
  reviewsController.update
);
reviewsRouter.delete(
  "/:id",
  requireVerified,
  validate({ params: reviewIdParamsSchema }),
  reviewsController.remove
);
