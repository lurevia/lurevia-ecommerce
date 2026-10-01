import { Router } from "express";
import { usersController } from "../controller/users.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { authRateLimiter } from "../../../middlewares/rateLimit.middleware";
import { changePasswordSchema, completeOAuthProfileSchema, requestDeletionSchema, updateProfileSchema } from "../dto";

const router = Router();

router.use(requireAuth);

router.patch(
    "/me",
    validate({ body: updateProfileSchema }),
    usersController.updateMe
);

router.patch(
    "/me/oauth-profile",
    validate({ body: completeOAuthProfileSchema }),
    usersController.completeOAuthProfile
);

router.post(
    "/me/change-password",
    authRateLimiter,
    validate({ body: changePasswordSchema }),
    usersController.changePassword
);

router.post(
    "/me/deletion-request",
    validate({ body: requestDeletionSchema }),
    usersController.requestDeletion
);

export default router;
