import { Router } from "express";
import { transfersController } from "./transfers.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  listTransfersQuerySchema,
  transferIdParamsSchema,
} from "./transfers.validators";

const router = Router();

router.use(requireAuth, requireRole("SELLER", "ADMIN"));

router.get(
  "/",
  validate({ query: listTransfersQuerySchema }),
  transfersController.listMine
);

router.get("/summary", transfersController.getSummary);

router.get(
  "/:id",
  validate({ params: transferIdParamsSchema }),
  transfersController.getById
);

export default router;