import { adminNotificationsRepository, type AdminNotificationsRepository } from "../repository/admin-notifications.repository";
import { normalizePagination, buildPaginatedResult } from "../../../utils/pagination";
import { type CreateAdminNotificationInput } from "../lib/type/admin.type";
import { adminNotificationMapper } from "../mapper/admin-notifications.mapper";

export class AdminNotificationsService {
    constructor(
        private readonly repository: AdminNotificationsRepository
    ) { }

    /**
     * Point d'entrée unique appelé depuis les autres modules (commandes,
     * avis, feedback, demandes de suppression) à chaque action cliente qui
     * modifie le serveur. Écriture immédiate en base — pas de recalcul à la
     * lecture, contrairement au système de notifications client.
     */
    notify(input: CreateAdminNotificationInput) {
        return this.repository.create(input);
    }

    async list(page?: number, limit?: number, unreadOnly?: boolean) {
        const pagination = normalizePagination(page, limit);
        const [items, totalItems] = await this.repository.findMany({
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit,
            unreadOnly,
        });
        return buildPaginatedResult(adminNotificationMapper.toOutputList(items), totalItems, pagination);
    }

    countUnread() {
        return this.repository.countUnread();
    }

    async markRead(id: string) {
        await this.repository.markRead(id);
    }

    async markAllRead() {
        await this.repository.markAllRead();
    }
}

export const adminNotificationsService = new AdminNotificationsService(adminNotificationsRepository);
