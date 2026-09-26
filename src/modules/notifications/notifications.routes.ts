import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { notificationsService } from "./notifications.service";

const notificationIdParamsSchema = z.object({ id: z.string().uuid() });

const notificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const notifications = await notificationsService.listAndGenerate(req.user!.id);
    res.status(200).json({ data: { notifications } });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markRead(req.user!.id, req.params.id);
    res.status(204).send();
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markAllRead(req.user!.id);
    res.status(204).send();
  }),

  clear: asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.clear(req.user!.id);
    res.status(204).send();
  }),
};

const router = Router();
router.use(requireAuth);

router.get("/", notificationsController.list);
router.post("/read-all", notificationsController.markAllRead);
router.post("/:id/read", validate({ params: notificationIdParamsSchema }), notificationsController.markRead);
router.delete("/", notificationsController.clear);

export default router;
