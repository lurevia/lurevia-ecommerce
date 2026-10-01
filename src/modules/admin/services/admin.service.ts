import { adminRepository, type AdminRepository } from "../repository/admin.repository";
import { adminNotificationsService, type AdminNotificationsService } from "./admin-notifications.service";
import { adminOrdersService, type AdminOrdersService } from "./admin-orders.service";
import { adminUsersService, type AdminUsersService } from "./admin-users.service";
import { adminModerationService, type AdminModerationService } from "./admin-moderation.service";
import { adminDeletionsService, type AdminDeletionsService } from "./admin-deletions.service";

export { adminVerificationService } from "./admin-verifications.service";
export { adminIdentityService } from "./admin-identity.service";

/**
 * Façade principale pour les opérations administratives.
 * Chaque domaine est géré par son sous-service spécialisé (utilisateurs, commandes, modération, suppressions).
 */
export class AdminService {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly adminNotificationsService: AdminNotificationsService,
        private readonly adminOrdersService: AdminOrdersService,
        private readonly adminUsersService: AdminUsersService,
        private readonly adminModerationService: AdminModerationService,
        private readonly adminDeletionsService: AdminDeletionsService
    ) { }

    // ─── Statistiques ───
    stats() {
        return this.adminRepository.stats();
    }

    // ─── Commandes ───
    listOrders(...args: Parameters<AdminOrdersService["listOrders"]>) {
        return this.adminOrdersService.listOrders(...args);
    }

    getOrder(...args: Parameters<AdminOrdersService["getOrder"]>) {
        return this.adminOrdersService.getOrder(...args);
    }

    // ─── Utilisateurs & Vendeurs ───
    listUsers(...args: Parameters<AdminUsersService["listUsers"]>) {
        return this.adminUsersService.listUsers(...args);
    }

    getUser(...args: Parameters<AdminUsersService["getUser"]>) {
        return this.adminUsersService.getUser(...args);
    }

    listSellers(...args: Parameters<AdminUsersService["listSellers"]>) {
        return this.adminUsersService.listSellers(...args);
    }

    updateUserRole(...args: Parameters<AdminUsersService["updateUserRole"]>) {
        return this.adminUsersService.updateUserRole(...args);
    }

    removeUser(...args: Parameters<AdminUsersService["removeUser"]>) {
        return this.adminUsersService.removeUser(...args);
    }

    createAdmin(...args: Parameters<AdminUsersService["createAdmin"]>) {
        return this.adminUsersService.createAdmin(...args);
    }

    // ─── Avis ───
    listReviews(...args: Parameters<AdminModerationService["listReviews"]>) {
        return this.adminModerationService.listReviews(...args);
    }

    removeReview(...args: Parameters<AdminModerationService["removeReview"]>) {
        return this.adminModerationService.removeReview(...args);
    }

    approveReview(...args: Parameters<AdminModerationService["approveReview"]>) {
        return this.adminModerationService.approveReview(...args);
    }

    rejectReview(...args: Parameters<AdminModerationService["rejectReview"]>) {
        return this.adminModerationService.rejectReview(...args);
    }

    // ─── Feedback ───
    listFeedback(...args: Parameters<AdminModerationService["listFeedback"]>) {
        return this.adminModerationService.listFeedback(...args);
    }

    respondToFeedback(...args: Parameters<AdminModerationService["respondToFeedback"]>) {
        return this.adminModerationService.respondToFeedback(...args);
    }

    removeFeedback(...args: Parameters<AdminModerationService["removeFeedback"]>) {
        return this.adminModerationService.removeFeedback(...args);
    }

    // ─── Suppression de compte ───
    listDeletionRequests(...args: Parameters<AdminDeletionsService["listDeletionRequests"]>) {
        return this.adminDeletionsService.listDeletionRequests(...args);
    }

    approveDeletionRequest(...args: Parameters<AdminDeletionsService["approveDeletionRequest"]>) {
        return this.adminDeletionsService.approveDeletionRequest(...args);
    }

    rejectDeletionRequest(...args: Parameters<AdminDeletionsService["rejectDeletionRequest"]>) {
        return this.adminDeletionsService.rejectDeletionRequest(...args);
    }

    // ─── Notifications admin ───
    listNotifications(page?: number, limit?: number, unreadOnly?: boolean) {
        return this.adminNotificationsService.list(page, limit, unreadOnly);
    }

    countUnreadNotifications() {
        return this.adminNotificationsService.countUnread();
    }

    markNotificationRead(id: string) {
        return this.adminNotificationsService.markRead(id);
    }

    markAllNotificationsRead() {
        return this.adminNotificationsService.markAllRead();
    }
}

export const adminService = new AdminService(adminRepository, adminNotificationsService, adminOrdersService, adminUsersService, adminModerationService, adminDeletionsService);
