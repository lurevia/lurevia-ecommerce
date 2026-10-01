import { Router } from "express";
import { exportController } from "../controller/export.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { cinRateLimiter } from "../../../middlewares/rateLimit.middleware";

const router = Router();

router.get(
    "/me",
    requireAuth,
    cinRateLimiter,
    exportController.exportUserBackup
);

export default router;
