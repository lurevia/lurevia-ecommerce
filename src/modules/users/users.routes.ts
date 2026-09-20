import { Router } from "express";
import { usersController } from "./users.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { changePasswordSchema, updateProfileSchema } from "./users.validators";

const router = Router();

router.use(requireAuth);
router.patch("/me", validate({ body: updateProfileSchema }), usersController.updateMe);
router.post("/me/change-password", validate({ body: changePasswordSchema }), usersController.changePassword);

export default router;
