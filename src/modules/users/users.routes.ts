import { Router } from "express";
import { usersController } from "./users.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { changePasswordSchema, completeOAuthProfileSchema, requestDeletionSchema, updateProfileSchema } from "./users.validators";

const router = Router();

router.use(requireAuth);
router.patch("/me", validate({ body: updateProfileSchema }), usersController.updateMe);
router.patch("/me/oauth-profile", validate({ body: completeOAuthProfileSchema }), usersController.completeOAuthProfile);
router.post("/me/change-password", validate({ body: changePasswordSchema }), usersController.changePassword);
router.post(
  "/me/deletion-request",
  validate({ body: requestDeletionSchema }),
  usersController.requestDeletion
);

export default router;
