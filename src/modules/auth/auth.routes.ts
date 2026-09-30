import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { loginSchema, oauthCallbackSchema } from "./auth.validators";
import { requireAuth } from "../../middlewares/auth.middleware";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login
);

router.post(
  "/oauth/callback",
  authRateLimiter,
  validate({ body: oauthCallbackSchema }),
  authController.oauthCallback
);

router.post("/refresh", authRateLimiter, authController.refresh);
router.post("/logout", authController.logout);

router.get("/me", requireAuth, authController.me);

router.post(
  "/verification/request",
  requireAuth,
  authController.requestVerification
);
router.get(
  "/verification/status",
  requireAuth,
  authController.verificationStatus
);

export default router;