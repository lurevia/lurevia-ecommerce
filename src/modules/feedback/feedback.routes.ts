import type { Request, Response } from "express";
import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createFeedbackSchema,
  feedbackIdParamsSchema,
  listFeedbackQuerySchema,
  updateFeedbackSchema,
} from "./feedback.validators";
import { feedbackService } from "./feedback.service";

const feedbackController = {
  listPublic: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page?: number; limit?: number };
    const result = await feedbackService.listPublic(page, limit);
    res.status(200).json({ data: result });
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await feedbackService.stats();
    res.status(200).json({ data: stats });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const items = await feedbackService.listMine(req.user!.id);
    res.status(200).json({ data: { feedback: items } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const feedback = await feedbackService.create(req.user!.id, req.body);
    res.status(201).json({ data: { feedback } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const feedback = await feedbackService.update(req.params.id, req.user!.id, req.body);
    res.status(200).json({ data: { feedback } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await feedbackService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  }),
};

const router = Router();

router.get("/", validate({ query: listFeedbackQuerySchema }), feedbackController.listPublic);
router.get("/stats", feedbackController.stats);
router.get("/me", requireAuth, feedbackController.listMine);
router.post("/", requireAuth, validate({ body: createFeedbackSchema }), feedbackController.create);
router.patch(
  "/:id",
  requireAuth,
  validate({ params: feedbackIdParamsSchema, body: updateFeedbackSchema }),
  feedbackController.update
);
router.delete("/:id", requireAuth, validate({ params: feedbackIdParamsSchema }), feedbackController.remove);

export default router;
