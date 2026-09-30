import { Router } from "express";
import { pickupPointsController } from "./pickup-points.controller";
import {
  requireAuth,
  requireRole,
} from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createPickupPointSchema,
  listPickupPointsQuerySchema,
  pickupPointIdParamsSchema,
  updatePickupPointSchema,
} from "./pickup-points.validators";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Public — liste des points relais actifs
// ═══════════════════════════════════════════════════════════════════════════
router.get("/public", pickupPointsController.listPublic);
router.get("/public/by-region", pickupPointsController.listByRegion);

// ═══════════════════════════════════════════════════════════════════════════
// Admin — CRUD
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN"),
  validate({ query: listPickupPointsQuerySchema }),
  pickupPointsController.list
);

router.get(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: pickupPointIdParamsSchema }),
  pickupPointsController.getById
);

router.post(
  "/admin",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: createPickupPointSchema }),
  pickupPointsController.create
);

router.patch(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: pickupPointIdParamsSchema, body: updatePickupPointSchema }),
  pickupPointsController.update
);

router.delete(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: pickupPointIdParamsSchema }),
  pickupPointsController.remove
);

export default router;