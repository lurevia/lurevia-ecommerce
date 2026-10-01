import { Router } from "express";
import { deliveryTrackingController } from "../controller/delivery-tracking.controller";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { historyQuerySchema, listMyDeliveriesQuerySchema, orderIdParamsSchema, pingSchema } from "../dto";

const router = Router();

router.use(requireAuth);

// ═══════════════════════════════════════════════════════════════════════════
// Espace livreur (SELLER ou ADMIN pour le MVP)
// ═══════════════════════════════════════════════════════════════════════════
router.get(
    "/my-deliveries",
    requireRole("SELLER", "ADMIN"),
    validate({ query: listMyDeliveriesQuerySchema }),
    deliveryTrackingController.listMyDeliveries
);

router.get(
    "/my-stats",
    requireRole("SELLER", "ADMIN"),
    deliveryTrackingController.getMyStats
);

router.post(
    "/:orderId/ping",
    requireRole("SELLER", "ADMIN"),
    validate({ params: orderIdParamsSchema, body: pingSchema }),
    deliveryTrackingController.ping
);

// ═══════════════════════════════════════════════════════════════════════════
// Lecture (client propriétaire, livreur assigné, ou admin)
// Le contrôle d'accès est fait dans le service.
// ═══════════════════════════════════════════════════════════════════════════
router.get(
    "/:orderId/latest",
    validate({ params: orderIdParamsSchema }),
    deliveryTrackingController.getLatest
);

router.get(
    "/:orderId/history",
    validate({ params: orderIdParamsSchema, query: historyQuerySchema }),
    deliveryTrackingController.getHistory
);

export default router;
