import { Router } from "express";
import { bidsController } from "./bids.controller";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createBidSchema,
  updateBidStatusSchema,
  productIdSchema
} from "./bids.validators";

const router = Router();

// Clients
router.post(
  "/",
  requireAuth,
  validate({ body: createBidSchema }),
  asyncHandler(bidsController.createBid)
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(bidsController.getMyBids)
);

// Admin / Sellers
router.get(
  "/product/:productId",
  requireAuth,
  requireRole("ADMIN", "SELLER"),
  validate({ params: productIdSchema }),
  asyncHandler(bidsController.getProductBids)
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "SELLER"),
  validate({ body: updateBidStatusSchema }),
  asyncHandler(bidsController.updateStatus)
);

export default router;
