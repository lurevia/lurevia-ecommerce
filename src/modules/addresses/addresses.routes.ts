import { Router } from "express";
import { addressesController } from "./addresses.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { addressBodySchema, addressIdParamsSchema, updateAddressBodySchema } from "./addresses.validators";

const router = Router();

router.use(requireAuth);

router.get("/", addressesController.list);
router.post("/", validate({ body: addressBodySchema }), addressesController.create);
router.patch(
  "/:id",
  validate({ params: addressIdParamsSchema, body: updateAddressBodySchema }),
  addressesController.update
);
router.delete("/:id", validate({ params: addressIdParamsSchema }), addressesController.remove);
router.post("/:id/default", validate({ params: addressIdParamsSchema }), addressesController.setDefault);

export default router;
