import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { adminController } from "./admin.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/verifications", adminController.listVerifications);
router.post("/verifications/:id/approve", adminController.approveVerification);
router.post("/verifications/:id/reject", adminController.rejectVerification);

export default router;