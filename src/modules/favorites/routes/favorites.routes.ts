import { Router } from "express";
import { favoritesController } from "../controller/favorites.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { favoriteParamsSchema, listFavoritesQuerySchema } from "../dto";

const router = Router();

router.use(requireAuth);

router.get(
    "/",
    validate({ query: listFavoritesQuerySchema }),
    favoritesController.list
);

router.post(
    "/:productId/toggle",
    validate({ params: favoriteParamsSchema }),
    favoritesController.toggle
);

export default router;
