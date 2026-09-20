import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  categoryIdParamsSchema,
  categorySlugParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./categories.validators";

const router = Router();

// ── Public ──
router.get("/", categoriesController.list);
router.get("/:slug", validate({ params: categorySlugParamsSchema }), categoriesController.getBySlug);

// ── Admin ──
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: createCategorySchema }),
  categoriesController.create
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: categoryIdParamsSchema, body: updateCategorySchema }),
  categoriesController.update
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: categoryIdParamsSchema }),
  categoriesController.remove
);

export default router;
