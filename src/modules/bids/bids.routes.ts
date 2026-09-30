import { Router } from "express";
import { bidsController } from "./bids.controller";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  createBidSchema,
  updateBidStatusSchema,
  productIdSchema,
  bidIdSchema,
  listProductBidsQuerySchema,
} from "./bids.validators";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Routes client (authentifié)
// ═══════════════════════════════════════════════════════════════════════════

router.post(
  "/",
  requireAuth,
  validate({ body: createBidSchema }),
  bidsController.createBid
);

router.get("/me", requireAuth, bidsController.getMyBids);

// ═══════════════════════════════════════════════════════════════════════════
// Routes vendeur/admin
// ═══════════════════════════════════════════════════════════════════════════

router.get(
  "/product/:productId",
  requireAuth,
  requireRole("ADMIN", "SELLER"),
  validate({ params: productIdSchema, query: listProductBidsQuerySchema }),
  bidsController.getProductBids
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "SELLER"),
  validate({ params: bidIdSchema, body: updateBidStatusSchema }),
  bidsController.updateStatus
);

export default router;