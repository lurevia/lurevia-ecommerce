import { Router } from "express";
import { feedbackController } from "../controller/feedback.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createFeedbackSchema, feedbackIdParamsSchema, listFeedbackQuerySchema, updateFeedbackSchema } from "../dto";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Public
// ═══════════════════════════════════════════════════════════════════════════
router.get(
    "/",
    validate({ query: listFeedbackQuerySchema }),
    feedbackController.listPublic
);

router.get("/stats", feedbackController.stats);

// ═══════════════════════════════════════════════════════════════════════════
// Authentifié
// ═══════════════════════════════════════════════════════════════════════════
router.get(
    "/me",
    requireAuth,
    validate({ query: listFeedbackQuerySchema }),
    feedbackController.listMine
);

router.post(
    "/",
    requireAuth,
    validate({ body: createFeedbackSchema }),
    feedbackController.create
);

router.patch(
    "/:id",
    requireAuth,
    validate({ params: feedbackIdParamsSchema, body: updateFeedbackSchema }),
    feedbackController.update
);

router.delete(
    "/:id",
    requireAuth,
    validate({ params: feedbackIdParamsSchema }),
    feedbackController.remove
);

export default router;
