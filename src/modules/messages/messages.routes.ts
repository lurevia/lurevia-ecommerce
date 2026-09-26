import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminFoundationService } from "../admin/adminFoundation";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(async (req, res) => {
  const messages = await adminFoundationService.listMessages(req.user!.id);
  res.json({ data: { messages } });
}));
router.post("/:id/read", validate({ params: z.object({ id: z.string().uuid() }) }), asyncHandler(async (req, res) => {
  await adminFoundationService.markMessageRead(req.user!.id, req.params.id);
  res.status(204).send();
}));
export default router;
