import type { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";
import { pickupPointsRepository } from "./pickup-points.repository";
import { adminPickupPointsService } from "./services/admin-pickup-points.service";

export { toPickupPointDto, type PickupPointWithRelations } from "./pickup-points.dto";

export const pickupPointsService = {
  // ─── Public ───
  async listPublic(filters?: {
    province?: ProvinceMadagascar;
    region?: RegionMadagascar;
    city?: string;
  }) {
    return pickupPointsRepository.findActive(filters);
  },

  async listByRegion(region: RegionMadagascar) {
    return pickupPointsRepository.findByRegion(region);
  },

  // ─── Admin (délégué) ───
  list: adminPickupPointsService.list.bind(adminPickupPointsService),
  getById: adminPickupPointsService.getById.bind(adminPickupPointsService),
  create: adminPickupPointsService.create.bind(adminPickupPointsService),
  update: adminPickupPointsService.update.bind(adminPickupPointsService),
  remove: adminPickupPointsService.remove.bind(adminPickupPointsService),
};
