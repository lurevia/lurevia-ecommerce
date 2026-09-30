import { Router } from "express";
import { settlementsController } from "./settlements.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  listSettlementsQuerySchema,
  settlementIdParamsSchema,
} from "./settlements.validators";

const router = Router();

router.use(requireAuth, requireRole("SELLER", "ADMIN"));

router.get(
  "/",
  validate({ query: listSettlementsQuerySchema }),
  settlementsController.listMine
);

router.get("/summary", settlementsController.getSummary);

router.get(
  "/:id",
  validate({ params: settlementIdParamsSchema }),
  settlementsController.getById
);

export default router;