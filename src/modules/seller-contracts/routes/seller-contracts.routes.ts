import { Router } from "express";
import { sellerContractsController } from "../controller/seller-contracts.controller";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { listSellerContractsQuerySchema, sellerContractIdParamsSchema } from "../dto";

const router = Router();

router.use(requireAuth, requireRole("SELLER", "ADMIN"));

router.get(
    "/",
    validate({ query: listSellerContractsQuerySchema }),
    sellerContractsController.listMine
);

router.get("/active", sellerContractsController.getActive);

router.get(
    "/:id",
    validate({ params: sellerContractIdParamsSchema }),
    sellerContractsController.getById
);

export default router;
