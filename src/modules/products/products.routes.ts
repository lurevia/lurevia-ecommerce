import { Router } from "express";
import { productsController } from "./products.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  searchSuggestionsQuerySchema,
  updateProductSchema,
} from "./products.validators";

const router = Router();

// ── Public ──
router.get("/", validate({ query: listProductsQuerySchema }), productsController.list);
router.get(
  "/search/suggestions",
  validate({ query: searchSuggestionsQuerySchema }),
  productsController.searchSuggestions
);
router.get("/:id", validate({ params: productIdParamsSchema }), productsController.getById);
router.get("/:id/related", validate({ params: productIdParamsSchema }), productsController.getRelated);

// ── Admin ──
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: createProductSchema }),
  productsController.create
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: productIdParamsSchema, body: updateProductSchema }),
  productsController.update
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: productIdParamsSchema }),
  productsController.remove
);

export default router;
