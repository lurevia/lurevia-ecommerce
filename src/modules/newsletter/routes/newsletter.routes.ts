import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { newsletterController } from "../controller/newsletter.controller";
import { confirmSchema, listNewsletterQuerySchema, subscribeSchema, unsubscribeSchema } from "../dto";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Public
// ═══════════════════════════════════════════════════════════════════════════
router.post(
    "/subscribe",
    validate({ body: subscribeSchema }),
    newsletterController.subscribe
);

router.post(
    "/confirm",
    validate({ body: confirmSchema }),
    newsletterController.confirm
);

router.post(
    "/unsubscribe",
    validate({ body: unsubscribeSchema }),
    newsletterController.unsubscribe
);

// ═══════════════════════════════════════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════════════════════════════════════
router.get(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    validate({ query: listNewsletterQuerySchema }),
    newsletterController.list
);

export default router;
