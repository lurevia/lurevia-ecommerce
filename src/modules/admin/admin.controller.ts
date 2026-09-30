import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminService, adminVerificationService, adminIdentityService } from "./admin.service";
import { adminFoundationService } from "./adminFoundation";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/apiResponse";

export const adminController = {
  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.stats();
    sendSuccess(res, { stats });
  }),

  listOrders: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listOrders(req.query as never);
    sendSuccess(res, result);
  }),

  getOrder: asyncHandler(async (req: Request, res: Response) => {
    const order = await adminService.getOrder(req.params.id);
    sendSuccess(res, { order });
  }),

  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listUsers(req.query as never);
    sendSuccess(res, result);
  }),

  listSellers: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listSellers(req.query as never);
    sendSuccess(res, result);
  }),

  getUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.getUser(req.params.id);
    sendSuccess(res, { user });
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUserRole(req.params.id, req.body.role);
    sendSuccess(res, { user });
  }),

  removeUser: asyncHandler(async (req: Request, res: Response) => {
    await adminService.removeUser(req.params.id, req.user!.id);
    sendNoContent(res);
  }),

  createAdmin: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.createAdmin(req.body, req.user!.id, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
    sendCreated(res, { user });
  }),

  listReviews: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listReviews(req.query as never);
    sendSuccess(res, result);
  }),

  approveReview: asyncHandler(async (req: Request, res: Response) => {
    const review = await adminService.approveReview(req.params.id, req.user!.id);
    sendSuccess(res, { review });
  }),

  rejectReview: asyncHandler(async (req: Request, res: Response) => {
    const review = await adminService.rejectReview(req.params.id, req.user!.id, req.body.reason);
    sendSuccess(res, { review });
  }),

  removeReview: asyncHandler(async (req: Request, res: Response) => {
    await adminService.removeReview(req.params.id);
    sendNoContent(res);
  }),

  listFeedback: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listFeedback(req.query as never);
    sendSuccess(res, result);
  }),

  respondToFeedback: asyncHandler(async (req: Request, res: Response) => {
    const feedback = await adminService.respondToFeedback(req.params.id, req.body.teamResponse);
    sendSuccess(res, { feedback });
  }),

  removeFeedback: asyncHandler(async (req: Request, res: Response) => {
    await adminService.removeFeedback(req.params.id);
    sendNoContent(res);
  }),

  listDeletionRequests: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listDeletionRequests(req.query as never);
    sendSuccess(res, result);
  }),

  approveDeletionRequest: asyncHandler(async (req: Request, res: Response) => {
    const request = await adminService.approveDeletionRequest(req.params.id, req.body);
    sendSuccess(res, { request });
  }),

  rejectDeletionRequest: asyncHandler(async (req: Request, res: Response) => {
    const request = await adminService.rejectDeletionRequest(req.params.id, req.body);
    sendSuccess(res, { request });
  }),

  listNotifications: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, unreadOnly } = req.query as unknown as {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    };
    const result = await adminService.listNotifications(page, limit, unreadOnly);
    sendSuccess(res, result);
  }),

  unreadNotificationsCount: asyncHandler(async (_req: Request, res: Response) => {
    const count = await adminService.countUnreadNotifications();
    sendSuccess(res, { count });
  }),

  markNotificationRead: asyncHandler(async (req: Request, res: Response) => {
    await adminService.markNotificationRead(req.params.id);
    sendNoContent(res);
  }),

  markAllNotificationsRead: asyncHandler(async (_req: Request, res: Response) => {
    await adminService.markAllNotificationsRead();
    sendNoContent(res);
  }),

  listVerifications: asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as
      | "PENDING" | "APPROVED" | "REJECTED" | "USED" | "EXPIRED"
      | undefined;
    const requests = await adminVerificationService.listRequests(
      status,
      req.query.search as string | undefined
    );
    sendSuccess(res, { requests });
  }),

  approveVerification: asyncHandler(async (req: Request, res: Response) => {
    const request = await adminVerificationService.approveRequest(req.params.id, req.user!.id);
    sendSuccess(res, {
      success: true,
      expiresAt: request.expiresAt,
      user: request.user
        ? { fullName: request.user.fullName, email: request.user.email }
        : undefined,
    });
  }),

  rejectVerification: asyncHandler(async (req: Request, res: Response) => {
    await adminVerificationService.rejectRequest(req.params.id, req.body.reason);
    sendNoContent(res);
  }),

  listIdentityVerifications: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminIdentityService.listRequests(req.query as never);
    sendSuccess(res, result);
  }),

  approveIdentityVerification: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminIdentityService.approveRequest(req.params.id, req.user!.id);
    sendSuccess(res, { success: true, verification: result });
  }),

  rejectIdentityVerification: asyncHandler(async (req: Request, res: Response) => {
    await adminIdentityService.rejectRequest(req.params.id, req.user!.id, req.body.reason);
    sendNoContent(res);
  }),

  listProfileChanges: asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined;
    const search = req.query.search as string | undefined;
    const requests = await adminFoundationService.listProfileChangeRequests(
      status,
      search
    );
    sendSuccess(res, { requests });
  }),

  reviewProfileChange: asyncHandler(async (req: Request, res: Response) => {
    const request = await adminFoundationService.reviewProfileChangeRequest(
      req.params.id,
      req.user!.id,
      req.body.approved,
      req.body.adminNote
    );
    sendSuccess(res, { request });
  }),

  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminFoundationService.sendMessage(req.user!.id, req.body);
    sendCreated(res, result);
  }),
};