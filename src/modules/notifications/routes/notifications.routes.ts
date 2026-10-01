import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { notificationsController } from "../controller/notifications.controller";
import { listNotificationsQuerySchema, notificationIdParamsSchema } from "../dto";

const router = Router();

router.use(requireAuth);

router.get(
    "/",
    validate({ query: listNotificationsQuerySchema }),
    notificationsController.list
);

router.get("/unread-count", notificationsController.unreadCount);

router.post("/read-all", notificationsController.markAllRead);

router.post(
    "/:id/read",
    validate({ params: notificationIdParamsSchema }),
    notificationsController.markRead
);

router.delete("/", notificationsController.clear);

export default router;
