import { Router } from "express";
import { exportController } from "./export.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get(
  "/me",
  requireAuth,
  asyncHandler(exportController.exportUserBackup)
);

export default router;
