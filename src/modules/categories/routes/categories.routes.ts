import { Router } from "express";
import { categoriesController } from "../controller/categories.controller";
import { requireAuth, requirePrimaryAdmin } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { categoryIdParamsSchema, categorySlugParamsSchema, createCategorySchema, reorderCategoriesSchema, updateCategorySchema } from "../dto";

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
    requirePrimaryAdmin,
    validate({ body: createCategorySchema }),
    categoriesController.create
);

router.patch(
    "/reorder",
    requireAuth,
    requirePrimaryAdmin,
    validate({ body: reorderCategoriesSchema }),
    categoriesController.reorder
);

router.get(
    "/id/:id",
    requireAuth,
    requirePrimaryAdmin,
    validate({ params: categoryIdParamsSchema }),
    categoriesController.getById
);

router.patch(
    "/:id",
    requireAuth,
    requirePrimaryAdmin,
    validate({ params: categoryIdParamsSchema, body: updateCategorySchema }),
    categoriesController.update
);

router.delete(
    "/:id",
    requireAuth,
    requirePrimaryAdmin,
    validate({ params: categoryIdParamsSchema }),
    categoriesController.remove
);

export default router;
