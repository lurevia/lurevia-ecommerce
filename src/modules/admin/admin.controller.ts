import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminService, adminVerificationService } from "./admin.service";
import { adminFoundationService } from "./adminFoundation";

export const adminController = {
  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.stats();
    res.status(200).json({ data: { stats } });
  }),

  listOrders: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listOrders(req.query as never);
    res.status(200).json({ data: result });
  }),

  getOrder: asyncHandler(async (req: Request, res: Response) => {
    const order = await adminService.getOrder(req.params.id);
    res.status(200).json({ data: { order } });
  }),

  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listUsers(req.query as never);
    res.status(200).json({ data: result });
  }),

  getUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.getUser(req.params.id);
    res.status(200).json({ data: { user } });
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUserRole(req.params.id, req.body.role);
    res.status(200).json({ data: { user } });
  }),

  removeUser: asyncHandler(async (req: Request, res: Response) => {
    await adminService.removeUser(req.params.id, req.user!.id);
    res.status(204).send();
  }),

  listReviews: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listReviews(req.query as never);
    res.status(200).json({ data: result });
  }),

  removeReview: asyncHandler(async (req: Request, res: Response) => {
    await adminService.removeReview(req.params.id);
    res.status(204).send();
  }),

  listFeedback: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listFeedback(req.query as never);
    res.status(200).json({ data: result });
  }),

  respondToFeedback: asyncHandler(async (req: Request, res: Response) => {
    const feedback = await adminService.respondToFeedback(req.params.id, req.body.teamResponse);
    res.status(200).json({ data: { feedback } });
  }),

  removeFeedback: asyncHandler(async (req: Request, res: Response) => {
    await adminService.removeFeedback(req.params.id);
    res.status(204).send();
  }),

  listDeletionRequests: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listDeletionRequests(req.query as never);
    res.status(200).json({ data: result });
  }),

  approveDeletionRequest: asyncHandler(async (req: Request, res: Response) => {
    const request = await adminService.approveDeletionRequest(req.params.id, req.body);
    res.status(200).json({ data: { request } });
  }),

  rejectDeletionRequest: asyncHandler(async (req: Request, res: Response) => {
    const request = await adminService.rejectDeletionRequest(req.params.id, req.body);
    res.status(200).json({ data: { request } });
  }),

  listNotifications: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, unreadOnly } = req.query as unknown as {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    };
    const result = await adminService.listNotifications(page, limit, unreadOnly);
    res.status(200).json({ data: result });
  }),

  unreadNotificationsCount: asyncHandler(async (_req: Request, res: Response) => {
    const count = await adminService.countUnreadNotifications();
    res.status(200).json({ data: { count } });
  }),

  markNotificationRead: asyncHandler(async (req: Request, res: Response) => {
    await adminService.markNotificationRead(req.params.id);
    res.status(204).send();
  }),

  markAllNotificationsRead: asyncHandler(async (_req: Request, res: Response) => {
    await adminService.markAllNotificationsRead();
    res.status(204).send();
  }),

  listVerifications: asyncHandler(async (req: Request, res: Response) => {
    const status = (req.query.status as "PENDING" | "APPROVED" | "REJECTED" | "USED" | "EXPIRED") ?? "PENDING";
    const requests = await adminVerificationService.listRequests(status);
    res.status(200).json({ data: { requests } });
  }),

  approveVerification: asyncHandler(async (req: Request, res: Response) => {
    const request = await adminVerificationService.approveRequest(req.params.id, req.user!.id);
    res.status(200).json({
      data: {
        success: true,
        expiresAt: request.expiresAt,
        user: request.user,
      },
    });
  }),

  rejectVerification: asyncHandler(async (req: Request, res: Response) => {
    await adminVerificationService.rejectRequest(req.params.id, req.body.reason);
    res.status(204).send();
  }),
  listProfileChanges: asyncHandler(async (req: Request, res: Response) => {
    const requests = await adminFoundationService.listProfileChangeRequests(req.query.status as any);
    res.status(200).json({ data: { requests } });
  }),
  reviewProfileChange: asyncHandler(async (req: Request, res: Response) => {
    const request = await adminFoundationService.reviewProfileChangeRequest(req.params.id, req.user!.id, req.body.approved, req.body.adminNote);
    res.status(200).json({ data: { request } });
  }),
  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminFoundationService.sendMessage(req.user!.id, req.body);
    res.status(201).json({ data: result });
  }),
};
