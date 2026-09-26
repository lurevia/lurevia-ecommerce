import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { updateSettingsSchema } from "./settings.validators";
import { settingsController } from "./settings.controller";

const router = Router();

// Public
router.get("/public/settings", settingsController.getPublic);

// Admin
router.get(
  "/admin/settings",
  requireAuth,
  requireRole("ADMIN"),
  settingsController.get
);

router.patch(
  "/admin/settings",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: updateSettingsSchema }),
  settingsController.update
);

export default router;