import { Router } from "express";
import { ordersController } from "./orders.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  checkoutSchema,
  listOrdersQuerySchema,
  orderIdParamsSchema,
  updateOrderStatusSchema,
} from "./orders.validators";

const router = Router();

router.use(requireAuth);

router.post("/", validate({ body: checkoutSchema }), ordersController.checkout);
router.get("/", validate({ query: listOrdersQuerySchema }), ordersController.list);
router.get("/:id", validate({ params: orderIdParamsSchema }), ordersController.getById);
router.post("/:id/cancel", validate({ params: orderIdParamsSchema }), ordersController.cancel);

// ── Admin ──
router.patch(
  "/:id/status",
  requireRole("ADMIN"),
  validate({ params: orderIdParamsSchema, body: updateOrderStatusSchema }),
  ordersController.adminUpdateStatus
);

export default router;
