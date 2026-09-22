import type { Request, Response, NextFunction } from "express";
import { adminVerificationService } from "./admin.service";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "USED" | "EXPIRED";

export const adminController = {
  async listVerifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = (req.query.status as VerificationStatus) ?? "PENDING";
      const requests = await adminVerificationService.listRequests(status);
      res.json({ requests });
    } catch (err) {
      next(err);
    }
  },

  async approveVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;

      const updated = await adminVerificationService.approveRequest(id, adminId);

      res.json({
        success: true,
        code: updated.code,
        expiresAt: updated.expiresAt,
        user: updated.user,
      });
    } catch (err) {
      next(err);
    }
  },

  async rejectVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      await adminVerificationService.rejectRequest(id, reason);

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};