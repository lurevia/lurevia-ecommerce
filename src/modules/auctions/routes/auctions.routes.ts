import { Router } from "express";
import { auctionsController } from "../controller/auctions.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { cinRateLimiter } from "../../../middlewares/rateLimit.middleware";
import { listAuctionsQuerySchema, listMessagesQuerySchema, messageIdParamsSchema, postMessageSchema, productIdParamsSchema } from "../dto";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Public (lecture)
// ═══════════════════════════════════════════════════════════════════════════
router.get(
    "/",
    validate({ query: listAuctionsQuerySchema }),
    auctionsController.list
);

router.get(
    "/:productId",
    validate({ params: productIdParamsSchema }),
    auctionsController.getByProductId
);

router.get(
    "/:productId/stats",
    validate({ params: productIdParamsSchema }),
    auctionsController.getStats
);

router.get(
    "/:productId/messages",
    validate({ params: productIdParamsSchema, query: listMessagesQuerySchema }),
    auctionsController.listMessages
);

router.get(
    "/:productId/watchers/count",
    validate({ params: productIdParamsSchema }),
    auctionsController.watcherCount
);

// ═══════════════════════════════════════════════════════════════════════════
// Authentifié (chat + watch)
// ═══════════════════════════════════════════════════════════════════════════
router.post(
    "/:productId/watch",
    requireAuth,
    validate({ params: productIdParamsSchema }),
    auctionsController.watch
);

router.delete(
    "/:productId/watch",
    requireAuth,
    validate({ params: productIdParamsSchema }),
    auctionsController.unwatch
);

router.post(
    "/:productId/messages",
    requireAuth,
    cinRateLimiter, // anti-spam
    validate({ params: productIdParamsSchema, body: postMessageSchema }),
    auctionsController.postMessage
);

router.delete(
    "/:productId/messages/:messageId",
    requireAuth,
    validate({ params: messageIdParamsSchema }),
    auctionsController.deleteMessage
);

export default router;
