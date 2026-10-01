import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { adminService, type AdminService } from "../services/admin.service";
import { adminVerificationService, type AdminVerificationService } from "../services/admin-verifications.service";
import { adminIdentityService, type AdminIdentityService } from "../services/admin-identity.service";
import { adminFoundationService, type AdminFoundationService } from "../services/admin-foundation.service";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";

export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly adminVerificationService: AdminVerificationService,
        private readonly adminIdentityService: AdminIdentityService,
        private readonly adminFoundationService: AdminFoundationService
    ) { }

    stats = asyncHandler(async (_req: Request, res: Response) => {
        const stats = await this.adminService.stats();
        sendSuccess(res, { stats });
    });

    listOrders = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminService.listOrders(req.query as never);
        sendSuccess(res, result);
    });

    getOrder = asyncHandler(async (req: Request, res: Response) => {
        const order = await this.adminService.getOrder(req.params.id);
        sendSuccess(res, { order });
    });

    listUsers = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminService.listUsers(req.query as never);
        sendSuccess(res, result);
    });

    listSellers = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminService.listSellers(req.query as never);
        sendSuccess(res, result);
    });

    getUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await this.adminService.getUser(req.params.id);
        sendSuccess(res, { user });
    });

    updateUserRole = asyncHandler(async (req: Request, res: Response) => {
        const user = await this.adminService.updateUserRole(req.params.id, req.body.role);
        sendSuccess(res, { user });
    });

    removeUser = asyncHandler(async (req: Request, res: Response) => {
        await this.adminService.removeUser(req.params.id, req.user!.id);
        sendNoContent(res);
    });

    createAdmin = asyncHandler(async (req: Request, res: Response) => {
        const user = await this.adminService.createAdmin(req.body, req.user!.id, {
            ipAddress: req.ip,
            userAgent: req.get("user-agent") ?? undefined,
        });
        sendCreated(res, { user });
    });

    listReviews = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminService.listReviews(req.query as never);
        sendSuccess(res, result);
    });

    approveReview = asyncHandler(async (req: Request, res: Response) => {
        const review = await this.adminService.approveReview(req.params.id, req.user!.id);
        sendSuccess(res, { review });
    });

    rejectReview = asyncHandler(async (req: Request, res: Response) => {
        const review = await this.adminService.rejectReview(req.params.id, req.user!.id, req.body.reason);
        sendSuccess(res, { review });
    });

    removeReview = asyncHandler(async (req: Request, res: Response) => {
        await this.adminService.removeReview(req.params.id);
        sendNoContent(res);
    });

    listFeedback = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminService.listFeedback(req.query as never);
        sendSuccess(res, result);
    });

    respondToFeedback = asyncHandler(async (req: Request, res: Response) => {
        const feedback = await this.adminService.respondToFeedback(req.params.id, req.body.teamResponse);
        sendSuccess(res, { feedback });
    });

    removeFeedback = asyncHandler(async (req: Request, res: Response) => {
        await this.adminService.removeFeedback(req.params.id);
        sendNoContent(res);
    });

    listDeletionRequests = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminService.listDeletionRequests(req.query as never);
        sendSuccess(res, result);
    });

    approveDeletionRequest = asyncHandler(async (req: Request, res: Response) => {
        const request = await this.adminService.approveDeletionRequest(req.params.id, req.body);
        sendSuccess(res, { request });
    });

    rejectDeletionRequest = asyncHandler(async (req: Request, res: Response) => {
        const request = await this.adminService.rejectDeletionRequest(req.params.id, req.body);
        sendSuccess(res, { request });
    });

    listNotifications = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, unreadOnly } = req.query as unknown as {
            page?: number;
            limit?: number;
            unreadOnly?: boolean;
        };
        const result = await this.adminService.listNotifications(page, limit, unreadOnly);
        sendSuccess(res, result);
    });

    unreadNotificationsCount = asyncHandler(async (_req: Request, res: Response) => {
        const count = await this.adminService.countUnreadNotifications();
        sendSuccess(res, { count });
    });

    markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
        await this.adminService.markNotificationRead(req.params.id);
        sendNoContent(res);
    });

    markAllNotificationsRead = asyncHandler(async (_req: Request, res: Response) => {
        await this.adminService.markAllNotificationsRead();
        sendNoContent(res);
    });

    listVerifications = asyncHandler(async (req: Request, res: Response) => {
        const status = req.query.status as
            | "PENDING" | "APPROVED" | "REJECTED" | "USED" | "EXPIRED"
            | undefined;
        const requests = await this.adminVerificationService.listRequests(
            status,
            req.query.search as string | undefined
        );
        sendSuccess(res, { requests });
    });

    approveVerification = asyncHandler(async (req: Request, res: Response) => {
        const request = await this.adminVerificationService.approveRequest(req.params.id, req.user!.id);
        sendSuccess(res, {
            success: true,
            expiresAt: request.expiresAt,
            user: request.user
                ? { fullName: request.user.fullName, email: request.user.email }
                : undefined,
        });
    });

    rejectVerification = asyncHandler(async (req: Request, res: Response) => {
        await this.adminVerificationService.rejectRequest(req.params.id, req.body.reason);
        sendNoContent(res);
    });

    listIdentityVerifications = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminIdentityService.listRequests(req.query as never);
        sendSuccess(res, result);
    });

    approveIdentityVerification = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminIdentityService.approveRequest(req.params.id, req.user!.id);
        sendSuccess(res, { success: true, verification: result });
    });

    rejectIdentityVerification = asyncHandler(async (req: Request, res: Response) => {
        await this.adminIdentityService.rejectRequest(req.params.id, req.user!.id, req.body.reason);
        sendNoContent(res);
    });

    listProfileChanges = asyncHandler(async (req: Request, res: Response) => {
        const status = req.query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined;
        const search = req.query.search as string | undefined;
        const requests = await this.adminFoundationService.listProfileChangeRequests(
            status,
            search
        );
        sendSuccess(res, { requests });
    });

    reviewProfileChange = asyncHandler(async (req: Request, res: Response) => {
        const request = await this.adminFoundationService.reviewProfileChangeRequest(
            req.params.id,
            req.user!.id,
            req.body.approved,
            req.body.adminNote
        );
        sendSuccess(res, { request });
    });

    sendMessage = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.adminFoundationService.sendMessage(req.user!.id, req.body);
        sendCreated(res, result);
    });
}

export const adminController = new AdminController(adminService, adminVerificationService, adminIdentityService, adminFoundationService);
