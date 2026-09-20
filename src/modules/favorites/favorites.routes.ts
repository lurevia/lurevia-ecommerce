import type { Request, Response } from "express";
import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { favoriteParamsSchema } from "./favorites.validators";
import { favoritesService } from "./favorites.service";

export const favoritesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const favorites = await favoritesService.list(req.user!.id);
    res.status(200).json({ data: { favorites } });
  }),

  toggle: asyncHandler(async (req: Request, res: Response) => {
    const result = await favoritesService.toggle(req.user!.id, req.params.productId);
    res.status(200).json({ data: result });
  }),
};

const router = Router();
router.use(requireAuth);
router.get("/", favoritesController.list);
router.post("/:productId/toggle", validate({ params: favoriteParamsSchema }), favoritesController.toggle);

export default router;
