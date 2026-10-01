import { Router } from "express";
import { shippingZonesController } from "../controller/shipping-zones.controller";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createShippingZoneSchema, listZonesQuerySchema, updateShippingZoneSchema, zoneIdParamsSchema } from "../dto";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Public — liste des zones actives (page Livraison)
// ═══════════════════════════════════════════════════════════════════════════
router.get("/public", shippingZonesController.listPublic);

// ═══════════════════════════════════════════════════════════════════════════
// Admin — CRUD
// ═══════════════════════════════════════════════════════════════════════════
router.get(
    "/admin",
    requireAuth,
    requireRole("ADMIN"),
    validate({ query: listZonesQuerySchema }),
    shippingZonesController.list
);

router.get(
    "/admin/:id",
    requireAuth,
    requireRole("ADMIN"),
    validate({ params: zoneIdParamsSchema }),
    shippingZonesController.getById
);

router.post(
    "/admin",
    requireAuth,
    requireRole("ADMIN"),
    validate({ body: createShippingZoneSchema }),
    shippingZonesController.create
);

router.patch(
    "/admin/:id",
    requireAuth,
    requireRole("ADMIN"),
    validate({ params: zoneIdParamsSchema, body: updateShippingZoneSchema }),
    shippingZonesController.update
);

router.delete(
    "/admin/:id",
    requireAuth,
    requireRole("ADMIN"),
    validate({ params: zoneIdParamsSchema }),
    shippingZonesController.remove
);

export default router;
