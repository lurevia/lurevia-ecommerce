import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { mediaController } from "./media.controller";
import { importMediaSchema } from "./media.validators";

const router = Router();
router.post("/import", requireAuth, validate({ body: importMediaSchema }), mediaController.import);
export default router;
