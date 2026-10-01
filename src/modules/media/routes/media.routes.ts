import express, { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { cinRateLimiter } from "../../../middlewares/rateLimit.middleware";
import { mediaController } from "../controller/media.controller";
import { importMediaSchema, listMediaQuerySchema, mediaIdParamsSchema, uploadMediaSchema } from "../dto";

const router = Router();

router.use(requireAuth);

const jsonLargeBody = express.json({ limit: "15mb" });

router.get(
    "/",
    validate({ query: listMediaQuerySchema }),
    mediaController.list
);

router.post(
    "/import",
    cinRateLimiter,
    validate({ body: importMediaSchema }),
    mediaController.import
);

router.post(
    "/upload",
    cinRateLimiter,
    jsonLargeBody,
    validate({ body: uploadMediaSchema }),
    mediaController.upload
);

router.delete(
    "/:id",
    validate({ params: mediaIdParamsSchema }),
    mediaController.remove
);

export default router;
