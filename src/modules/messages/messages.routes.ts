import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { messagesController } from "./messages.controller";
import {
  listMessagesQuerySchema,
  messageIdParamsSchema,
} from "./messages.validators";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  validate({ query: listMessagesQuerySchema }),
  messagesController.list
);

router.get("/unread-count", messagesController.unreadCount);

router.post("/read-all", messagesController.markAllRead);

router.get(
  "/:id",
  validate({ params: messageIdParamsSchema }),
  messagesController.getById
);

router.post(
  "/:id/read",
  validate({ params: messageIdParamsSchema }),
  messagesController.markRead
);

export default router;