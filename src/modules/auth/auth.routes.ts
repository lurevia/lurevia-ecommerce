import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema, verificationCodeSchema } from "./auth.validators";
import { requireAuth } from "../../middlewares/auth.middleware";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", authRateLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post("/refresh", authRateLimiter, authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);
router.post("/verification/request", requireAuth, authController.requestVerification);
router.get("/verification/status", requireAuth, authController.verificationStatus);
router.post(
  "/verification/confirm",
  requireAuth,
  validate({ body: verificationCodeSchema }),
  authController.confirmVerification
);

export default router;
