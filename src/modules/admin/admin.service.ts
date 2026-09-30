import { adminRepository } from "./admin.repository";
import { adminNotificationsService } from "./adminNotifications.service";
import { adminOrdersService } from "./services/admin-orders.service";
import { adminUsersService } from "./services/admin-users.service";
import { adminModerationService } from "./services/admin-moderation.service";
import { adminDeletionsService } from "./services/admin-deletions.service";

export { adminVerificationService } from "./services/admin-verifications.service";
export { adminIdentityService } from "./services/admin-identity.service";

/**
 * Façade principale pour les opérations administratives.
 * Chaque domaine est géré par son sous-service spécialisé (utilisateurs, commandes, modération, suppressions).
 */
export const adminService = {
  // ─── Statistiques ───
  stats: () => adminRepository.stats(),

  // ─── Commandes ───
  listOrders: adminOrdersService.listOrders.bind(adminOrdersService),
  getOrder: adminOrdersService.getOrder.bind(adminOrdersService),

  // ─── Utilisateurs & Vendeurs ───
  listUsers: adminUsersService.listUsers.bind(adminUsersService),
  getUser: adminUsersService.getUser.bind(adminUsersService),
  listSellers: adminUsersService.listSellers.bind(adminUsersService),
  updateUserRole: adminUsersService.updateUserRole.bind(adminUsersService),
  removeUser: adminUsersService.removeUser.bind(adminUsersService),
  createAdmin: adminUsersService.createAdmin.bind(adminUsersService),

  // ─── Avis ───
  listReviews: adminModerationService.listReviews.bind(adminModerationService),
  removeReview: adminModerationService.removeReview.bind(adminModerationService),
  approveReview: adminModerationService.approveReview.bind(adminModerationService),
  rejectReview: adminModerationService.rejectReview.bind(adminModerationService),

  // ─── Feedback ───
  listFeedback: adminModerationService.listFeedback.bind(adminModerationService),
  respondToFeedback: adminModerationService.respondToFeedback.bind(adminModerationService),
  removeFeedback: adminModerationService.removeFeedback.bind(adminModerationService),

  // ─── Suppression de compte ───
  listDeletionRequests: adminDeletionsService.listDeletionRequests.bind(adminDeletionsService),
  approveDeletionRequest: adminDeletionsService.approveDeletionRequest.bind(adminDeletionsService),
  rejectDeletionRequest: adminDeletionsService.rejectDeletionRequest.bind(adminDeletionsService),

  // ─── Notifications admin ───
  listNotifications: (page?: number, limit?: number, unreadOnly?: boolean) =>
    adminNotificationsService.list(page, limit, unreadOnly),
  countUnreadNotifications: () => adminNotificationsService.countUnread(),
  markNotificationRead: (id: string) => adminNotificationsService.markRead(id),
  markAllNotificationsRead: () => adminNotificationsService.markAllRead(),
};
