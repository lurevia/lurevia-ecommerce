import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  categoryIdParamsSchema,
  categorySlugParamsSchema,
  createCategorySchema,
  reorderCategoriesSchema,
  updateCategorySchema,
} from "./categories.validators";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// Public
// ═══════════════════════════════════════════════════════════════════════════
router.get("/", categoriesController.list);
router.get(
  "/:slug",
  validate({ params: categorySlugParamsSchema }),
  categoriesController.getBySlug
);

// ═══════════════════════════════════════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════════════════════════════════════
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: createCategorySchema }),
  categoriesController.create
);

router.patch(
  "/reorder",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: reorderCategoriesSchema }),
  categoriesController.reorder
);

router.get(
  "/id/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: categoryIdParamsSchema }),
  categoriesController.getById
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