import { Router } from "express";
import { productsController } from "../controller/products.controller";
import { requireAuth, requireRole, requireVerified } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createProductSchema, listProductsQuerySchema, productIdParamsSchema, productSlugParamsSchema, searchSuggestionsQuerySchema, updateProductSchema } from "../dto";

const router = Router();

router.get(
    "/",
    validate({ query: listProductsQuerySchema }),
    productsController.list
);

router.get(
    "/search/suggestions",
    validate({ query: searchSuggestionsQuerySchema }),
    productsController.searchSuggestions
);

router.get(
    "/slug/:slug",
    validate({ params: productSlugParamsSchema }),
    productsController.getBySlug
);

router.get(
    "/:id",
    validate({ params: productIdParamsSchema }),
    productsController.getById
);

router.get(
    "/:id/related",
    validate({ params: productIdParamsSchema }),
    productsController.getRelated
);

router.get(
    "/seller/mine",
    requireAuth,
    requireRole("SELLER", "ADMIN"),
    productsController.listMine
);

router.post(
    "/",
    requireAuth,
    requireRole("SELLER", "ADMIN"),
    requireVerified,
    validate({ body: createProductSchema }),
    productsController.create
);

router.patch(
    "/:id",
    requireAuth,
    requireRole("SELLER", "ADMIN"),
    validate({ params: productIdParamsSchema, body: updateProductSchema }),
    productsController.update
);

router.delete(
    "/:id",
    requireAuth,
    requireRole("SELLER", "ADMIN"),
    validate({ params: productIdParamsSchema }),
    productsController.remove
);

export default router;
