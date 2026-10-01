import express, { Router } from "express";
import { paymentsController } from "../controller/payments.controller";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { authRateLimiter } from "../../../middlewares/rateLimit.middleware";
import { initiatePaymentSchema, listTransactionsQuerySchema, providerParamsSchema, refundSchema, transactionIdParamsSchema } from "../dto";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Webhooks (PUBLIC — signature vérifiée dans le service)
// ═══════════════════════════════════════════════════════════════════════════
router.post(
    "/webhooks/:provider",
    express.json({ limit: "100kb", type: "application/json" }),
    validate({ params: providerParamsSchema }),
    paymentsController.webhook
);

// ═══════════════════════════════════════════════════════════════════════════
// Client (authentifié)
// ═══════════════════════════════════════════════════════════════════════════
router.post(
    "/initiate",
    requireAuth,
    authRateLimiter,
    validate({ body: initiatePaymentSchema }),
    paymentsController.initiate
);

router.get(
    "/",
    requireAuth,
    validate({ query: listTransactionsQuerySchema }),
    paymentsController.listMine
);

router.get(
    "/:transactionId",
    requireAuth,
    validate({ params: transactionIdParamsSchema }),
    paymentsController.getById
);

// ═══════════════════════════════════════════════════════════════════════════
// Admin — remboursement
// ═══════════════════════════════════════════════════════════════════════════
router.post(
    "/:transactionId/refund",
    requireAuth,
    requireRole("ADMIN"),
    validate({ params: transactionIdParamsSchema, body: refundSchema }),
    paymentsController.refund
);

export default router;
