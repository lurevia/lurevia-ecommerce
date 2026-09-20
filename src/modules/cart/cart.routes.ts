import { Router } from "express";
import { cartController } from "./cart.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { addCartItemSchema, cartItemParamsSchema, updateCartItemBodySchema } from "./cart.validators";

const router = Router();

router.use(requireAuth);

router.get("/", cartController.get);
router.post("/items", validate({ body: addCartItemSchema }), cartController.addItem);
router.patch(
  "/items/:productId",
  validate({ params: cartItemParamsSchema, body: updateCartItemBodySchema }),
  cartController.updateItem
);
router.delete("/items/:productId", validate({ params: cartItemParamsSchema }), cartController.removeItem);
router.delete("/", cartController.clear);

export default router;
