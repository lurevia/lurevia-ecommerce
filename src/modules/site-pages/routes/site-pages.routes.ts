import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import {
  createSitePageSchema,
  sitePageIdSchema,
  updateSitePageSchema,
} from "../dto";
import { sitePagesController } from "../controller/site-pages.controller";

const router = Router();

router.get("/public", sitePagesController.listPublished);
router.get("/public/:slug", sitePagesController.getPublished);

router.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN"),
  sitePagesController.listAdmin
);
router.post(
  "/admin",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: createSitePageSchema }),
  sitePagesController.create
);
router.patch(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: sitePageIdSchema }),
  validate({ body: updateSitePageSchema }),
  sitePagesController.update
);
router.delete(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: sitePageIdSchema }),
  sitePagesController.remove
);

export default router;
