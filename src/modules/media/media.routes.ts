import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { mediaController } from "./media.controller";
import { importMediaSchema, uploadMediaSchema } from "./media.validators";

const router = Router();
router.post("/import", requireAuth, validate({ body: importMediaSchema }), mediaController.import);
router.post("/upload", requireAuth, validate({ body: uploadMediaSchema }), mediaController.upload);
export default router;
