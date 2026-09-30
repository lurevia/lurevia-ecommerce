import { Router } from "express";
import { adminController } from "./admin.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { adminRateLimiter } from "../../middlewares/rateLimit.middleware";
import { financialController } from "../financial/financial.controller";
import {
  contractIdSchema,
  contractListSchema,
  financialListSchema,
  reviewContractSchema,
  transferSchema,
} from "../financial/financial.validators";
import {
  idParamsSchema,
  listDeletionRequestsQuerySchema,
  listNotificationsQuerySchema,
  listOrdersQuerySchema,
  listReviewsQuerySchema,
  listFeedbackQuerySchema,
  feedbackResponseSchema,
  listUsersQuerySchema,
  processDeletionRequestSchema,
  updateUserRoleSchema,
  verificationRejectSchema,
  verificationStatusQuerySchema,
  profileChangeStatusQuerySchema,
  adminMessageSchema,
  reviewProfileChangeSchema,
  createAdminSchema,
  sellerListQuerySchema,
  rejectReviewSchema,
  identityVerificationStatusQuerySchema,
  identityVerificationRejectSchema,
} from "./admin.validators";

const router = Router();

// ✅ Ordre : requireAuth → requireRole → adminRateLimiter
//    Ne pénalise les non-admins avec un compteur de rate limit
router.use(requireAuth, requireRole("ADMIN"), adminRateLimiter);

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL (contrats vendeurs, commissions, transferts)
// ═══════════════════════════════════════════════════════════════════════════
router.get("/financial/stats", financialController.stats);

router.get(
  "/financial/contracts",
  validate({ query: contractListSchema }),
  financialController.contracts
);
router.post(
  "/financial/contracts/:id/review",
  validate({ params: contractIdSchema, body: reviewContractSchema }),
  financialController.reviewContract
);

router.get(
  "/financial/settlements",
  validate({ query: financialListSchema }),
  financialController.settlements
);
router.get(
  "/financial/commissions",
  validate({ query: financialListSchema }),
  financialController.commissions
);
router.get(
  "/financial/transfers",
  validate({ query: financialListSchema }),
  financialController.transfers
);
router.post(
  "/financial/settlements/:id/transfer",
  validate({ params: contractIdSchema, body: transferSchema }),
  financialController.createTransfer
);

// ═══════════════════════════════════════════════════════════════════════════
// TABLEAU DE BORD
// ═══════════════════════════════════════════════════════════════════════════
router.get("/stats", adminController.stats);

// ═══════════════════════════════════════════════════════════════════════════
// UTILISATEURS & VENDEURS
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/users",
  validate({ query: listUsersQuerySchema }),
  adminController.listUsers
);
router.get("/users/:id", validate({ params: idParamsSchema }), adminController.getUser);
router.patch(
  "/users/:id/role",
  validate({ params: idParamsSchema, body: updateUserRoleSchema }),
  adminController.updateUserRole
);
router.delete(
  "/users/:id",
  validate({ params: idParamsSchema }),
  adminController.removeUser
);

router.get(
  "/sellers",
  validate({ query: sellerListQuerySchema }),
  adminController.listSellers
);

router.post(
  "/admins",
  validate({ body: createAdminSchema }),
  adminController.createAdmin
);

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDES
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/orders",
  validate({ query: listOrdersQuerySchema }),
  adminController.listOrders
);
router.get("/orders/:id", validate({ params: idParamsSchema }), adminController.getOrder);

// ═══════════════════════════════════════════════════════════════════════════
// AVIS
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/reviews",
  validate({ query: listReviewsQuerySchema }),
  adminController.listReviews
);
router.post(
  "/reviews/:id/approve",
  validate({ params: idParamsSchema }),
  adminController.approveReview
);
router.post(
  "/reviews/:id/reject",
  validate({ params: idParamsSchema, body: rejectReviewSchema }),
  adminController.rejectReview
);
router.delete(
  "/reviews/:id",
  validate({ params: idParamsSchema }),
  adminController.removeReview
);

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/feedback",
  validate({ query: listFeedbackQuerySchema }),
  adminController.listFeedback
);
router.patch(
  "/feedback/:id",
  validate({ params: idParamsSchema, body: feedbackResponseSchema }),
  adminController.respondToFeedback
);
router.delete(
  "/feedback/:id",
  validate({ params: idParamsSchema }),
  adminController.removeFeedback
);

// ═══════════════════════════════════════════════════════════════════════════
// DEMANDES DE SUPPRESSION DE COMPTE
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/deletion-requests",
  validate({ query: listDeletionRequestsQuerySchema }),
  adminController.listDeletionRequests
);
router.post(
  "/deletion-requests/:id/approve",
  validate({ params: idParamsSchema, body: processDeletionRequestSchema }),
  adminController.approveDeletionRequest
);
router.post(
  "/deletion-requests/:id/reject",
  validate({ params: idParamsSchema, body: processDeletionRequestSchema }),
  adminController.rejectDeletionRequest
);

// ═══════════════════════════════════════════════════════════════════════════
// VÉRIFICATION DE COMPTE (email/phone — ancien workflow)
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/verifications",
  validate({ query: verificationStatusQuerySchema }),
  adminController.listVerifications
);
router.post(
  "/verifications/:id/approve",
  validate({ params: idParamsSchema }),
  adminController.approveVerification
);
router.post(
  "/verifications/:id/reject",
  validate({ params: idParamsSchema, body: verificationRejectSchema }),
  adminController.rejectVerification
);

// ═══════════════════════════════════════════════════════════════════════════
// ✅ VÉRIFICATION D'IDENTITÉ (CIN + tuteur — nouveau workflow)
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/identity-verifications",
  validate({ query: identityVerificationStatusQuerySchema }),
  adminController.listIdentityVerifications
);
router.post(
  "/identity-verifications/:id/approve",
  validate({ params: idParamsSchema }),
  adminController.approveIdentityVerification
);
router.post(
  "/identity-verifications/:id/reject",
  validate({ params: idParamsSchema, body: identityVerificationRejectSchema }),
  adminController.rejectIdentityVerification
);

// ═══════════════════════════════════════════════════════════════════════════
// MODIFICATION DE PROFIL
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/profile-change-requests",
  validate({ query: profileChangeStatusQuerySchema }),
  adminController.listProfileChanges
);
router.post(
  "/profile-change-requests/:id/review",
  validate({ params: idParamsSchema, body: reviewProfileChangeSchema }),
  adminController.reviewProfileChange
);

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGES ADMIN
// ═══════════════════════════════════════════════════════════════════════════
router.post(
  "/messages",
  validate({ body: adminMessageSchema }),
  adminController.sendMessage
);

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS ADMIN
// ═══════════════════════════════════════════════════════════════════════════
router.get(
  "/notifications",
  validate({ query: listNotificationsQuerySchema }),
  adminController.listNotifications
);
router.get("/notifications/unread-count", adminController.unreadNotificationsCount);
router.post(
  "/notifications/:id/read",
  validate({ params: idParamsSchema }),
  adminController.markNotificationRead
);
router.post("/notifications/read-all", adminController.markAllNotificationsRead);

export default router;