import { notificationsRepository, type NotificationsRepository } from "../repository/notifications.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { notificationTriggersService, type NotificationTriggersService } from "./notifications-triggers.service";
import { notificationsMapper } from "../mapper/notifications.mapper";

export class NotificationsService {
    constructor(
        private readonly notificationsRepository: NotificationsRepository,
        private readonly notificationTriggersService: NotificationTriggersService
    ) { }

    // ─── Liste & lecture ───
    async listAndGenerate(userId: string, page?: number, limit?: number) {
        await this.notificationTriggersService.generateReviewReminders(userId);

        const pagination = normalizePagination(page, limit);
        const [items, totalItems] = await this.notificationsRepository.findManyByUser(
            userId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );

        return buildPaginatedResult(
            notificationsMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    // ─── Déclencheurs de notifications ───

    // ─── Statut de lecture ───
    async markRead(userId: string, id: string) {
        await this.notificationsRepository.markRead(userId, id);
    }

    async markAllRead(userId: string) {
        await this.notificationsRepository.markAllRead(userId);
    }

    async clear(userId: string) {
        await this.notificationsRepository.deleteAllForUser(userId);
    }

    async countUnread(userId: string) {
        return this.notificationsRepository.countUnread(userId);
    }
}

export const notificationsService = new NotificationsService(notificationsRepository, notificationTriggersService);
