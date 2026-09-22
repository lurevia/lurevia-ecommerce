import { Router } from "express";
import { adminController } from "./admin.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { adminRateLimiter } from "../../middlewares/rateLimit.middleware";
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
} from "./admin.validators";

const router = Router();

// Tout l'espace admin exige un compte authentifié avec le rôle ADMIN.
router.use(requireAuth, requireRole("ADMIN"), adminRateLimiter);

router.get("/stats", adminController.stats);
router.get("/profile-change-requests", validate({ query: profileChangeStatusQuerySchema }), adminController.listProfileChanges);
router.post("/profile-change-requests/:id/review", validate({ params: idParamsSchema, body: reviewProfileChangeSchema }), adminController.reviewProfileChange);
router.post("/messages", validate({ body: adminMessageSchema }), adminController.sendMessage);

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

router.get("/orders", validate({ query: listOrdersQuerySchema }), adminController.listOrders);
router.get("/orders/:id", validate({ params: idParamsSchema }), adminController.getOrder);

router.get("/users", validate({ query: listUsersQuerySchema }), adminController.listUsers);
router.get("/users/:id", validate({ params: idParamsSchema }), adminController.getUser);
router.patch(
  "/users/:id/role",
  validate({ params: idParamsSchema, body: updateUserRoleSchema }),
  adminController.updateUserRole
);
router.delete("/users/:id", validate({ params: idParamsSchema }), adminController.removeUser);

router.get("/reviews", validate({ query: listReviewsQuerySchema }), adminController.listReviews);
router.delete("/reviews/:id", validate({ params: idParamsSchema }), adminController.removeReview);
router.get("/feedback", validate({ query: listFeedbackQuerySchema }), adminController.listFeedback);
router.patch(
  "/feedback/:id",
  validate({ params: idParamsSchema, body: feedbackResponseSchema }),
  adminController.respondToFeedback
);
router.delete("/feedback/:id", validate({ params: idParamsSchema }), adminController.removeFeedback);

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
