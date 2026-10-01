import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { validate } from "../../../middlewares/validate.middleware";
import { loginSchema, oauthCallbackSchema, registerSchema } from "../dto";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { authRateLimiter } from "../../../middlewares/rateLimit.middleware";

const router = Router();

router.post(
    "/register",
    authRateLimiter,
    validate({ body: registerSchema }),
    authController.register
);

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

export default router;
