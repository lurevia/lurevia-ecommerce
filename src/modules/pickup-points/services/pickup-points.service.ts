import type { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";
import { pickupPointsRepository, type PickupPointsRepository } from "../repository/pickup-points.repository";
import { adminPickupPointsService, type AdminPickupPointsService } from "./admin-pickup-points.service";

export class PickupPointsService {
    constructor(
        private readonly pickupPointsRepository: PickupPointsRepository,
        private readonly adminPickupPointsService: AdminPickupPointsService
    ) { }

    // ─── Public ───
    async listPublic(filters?: {
        province?: ProvinceMadagascar;
        region?: RegionMadagascar;
        city?: string;
    }) {
        return this.pickupPointsRepository.findActive(filters);
    }

    async listByRegion(region: RegionMadagascar) {
        return this.pickupPointsRepository.findByRegion(region);
    }

    // ─── Admin (délégué) ───
    list(...args: Parameters<AdminPickupPointsService["list"]>) {
        return this.adminPickupPointsService.list(...args);
    }

    getById(...args: Parameters<AdminPickupPointsService["getById"]>) {
        return this.adminPickupPointsService.getById(...args);
    }

    create(...args: Parameters<AdminPickupPointsService["create"]>) {
        return this.adminPickupPointsService.create(...args);
    }

    update(...args: Parameters<AdminPickupPointsService["update"]>) {
        return this.adminPickupPointsService.update(...args);
    }

    remove(...args: Parameters<AdminPickupPointsService["remove"]>) {
        return this.adminPickupPointsService.remove(...args);
    }
}

export const pickupPointsService = new PickupPointsService(pickupPointsRepository, adminPickupPointsService);
