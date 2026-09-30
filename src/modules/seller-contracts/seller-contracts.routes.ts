import { Router } from "express";
import { sellerContractsController } from "./seller-contracts.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  listSellerContractsQuerySchema,
  sellerContractIdParamsSchema,
} from "./seller-contracts.validators";

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