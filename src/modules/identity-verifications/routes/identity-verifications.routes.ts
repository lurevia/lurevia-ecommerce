import { Router } from "express";
import { identityVerificationsController } from "../controller/identity-verifications.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { cinRateLimiter } from "../../../middlewares/rateLimit.middleware";
import { listMyVerificationsQuerySchema, submitVerificationSchema, verificationIdParamsSchema } from "../dto";

const router = Router();

router.use(requireAuth);

// ═══════════════════════════════════════════════════════════════════════════
// Soumission (rate limitée pour éviter le spam)
// ═══════════════════════════════════════════════════════════════════════════
router.post(
    "/",
    cinRateLimiter,
    validate({ body: submitVerificationSchema }),
    identityVerificationsController.submit
);

// ═══════════════════════════════════════════════════════════════════════════
// Lecture
// ═══════════════════════════════════════════════════════════════════════════
router.get(
    "/",
    validate({ query: listMyVerificationsQuerySchema }),
    identityVerificationsController.listMine
);

router.get("/status", identityVerificationsController.getStatus);

router.get(
    "/:id",
    validate({ params: verificationIdParamsSchema }),
    identityVerificationsController.getById
);

// ═══════════════════════════════════════════════════════════════════════════
// Annulation
// ═══════════════════════════════════════════════════════════════════════════
router.delete(
    "/:id",
    validate({ params: verificationIdParamsSchema }),
    identityVerificationsController.cancel
);

export default router;
