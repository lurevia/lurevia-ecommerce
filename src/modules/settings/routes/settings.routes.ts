import { Router } from "express";
import { validate } from "../../../middlewares/validate.middleware";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { updateSettingsSchema } from "../dto";
import { settingsController } from "../controller/settings.controller";

const router = Router();

router.get("/public", settingsController.getPublic);

router.get(
    "/admin",
    requireAuth,
    requireRole("ADMIN"),
    settingsController.get
);

router.patch(
    "/admin",
    requireAuth,
    requireRole("ADMIN"),
    validate({ body: updateSettingsSchema }),
    settingsController.update
);

export default router;
