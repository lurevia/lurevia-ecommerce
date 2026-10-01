import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { addressesController } from "../controller/addresses.controller";
import {
    addressIdParamsSchema,
    createAddressSchema,
    updateAddressSchema,
} from "../dto";

const router = Router();

router.use(requireAuth);

router.get("/", addressesController.list);

router.post(
    "/",
    validate({ body: createAddressSchema }),
    addressesController.create
);

router.get(
    "/:id",
    validate({ params: addressIdParamsSchema }),
    addressesController.getById
);

router.patch(
    "/:id",
    validate({ params: addressIdParamsSchema, body: updateAddressSchema }),
    addressesController.update
);

router.delete(
    "/:id",
    validate({ params: addressIdParamsSchema }),
    addressesController.remove
);

router.post(
    "/:id/default",
    validate({ params: addressIdParamsSchema }),
    addressesController.setDefault
);

export default router;