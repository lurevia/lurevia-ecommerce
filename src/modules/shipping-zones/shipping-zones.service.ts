import { shippingZonesRepository } from "./shipping-zones.repository";
import {
  ConflictError,
  NotFoundError,
} from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import type {
  ShippingZone,
  ProvinceMadagascar,
  RegionMadagascar,
} from "@prisma/client";
import type {
  CreateShippingZoneInput,
  ListZonesQuery,
  UpdateShippingZoneInput,
} from "./shipping-zones.validators";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────

type ZoneWithCounts = ShippingZone & {
  _count?: { orders: number; pickupPoints: number };
};

const toZoneDto = (zone: ZoneWithCounts) => ({
  id: zone.id,
  name: zone.name,
  province: zone.province,
  regions: zone.regions,
  basePrice: zone.basePrice,
  pricePerKg: zone.pricePerKg,
  estimatedDays: zone.estimatedDays,
  isActive: zone.isActive,
  ordersCount: zone._count?.orders ?? 0,
  pickupPointsCount: zone._count?.pickupPoints ?? 0,
  createdAt: zone.createdAt,
  updatedAt: zone.updatedAt,
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const shippingZonesService = {
  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Liste publique des zones actives.
   * Utilisé par la page "Livraison" et le calculateur côté front.
   */
  async listPublic() {
    return shippingZonesRepository.findActive();
  },

  /**
   * Cherche la zone applicable pour une région donnée.
   * Fallback sur la province si aucune zone ne couvre la région exacte.
   *
   * Utilisé par `ordersService.computeShippingCost`.
   */
  async findForRegion(
    region: RegionMadagascar,
    province: ProvinceMadagascar
  ): Promise<{ cost: number; zoneId?: string; estimatedDays?: number }> {
    // 1. Essaie la région exacte
    const exact = await shippingZonesRepository.findByRegion(region);
    if (exact) {
      return {
        cost: exact.basePrice,
        zoneId: exact.id,
        estimatedDays: exact.estimatedDays ?? undefined,
      };
    }

    // 2. Fallback sur la province
    const byProvince = await shippingZonesRepository.findByProvince(province);
    if (byProvince) {
      return {
        cost: byProvince.basePrice,
        zoneId: byProvince.id,
        estimatedDays: byProvince.estimatedDays ?? undefined,
      };
    }

    // 3. Aucune zone : renvoie coût 0 (le service appelant met le défaut)
    return { cost: 0 };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════════════════════════════════════

  async list(query: ListZonesQuery) {
    const pagination = normalizePagination(query.page, query.limit);

    const where = {
      ...(query.province ? { province: query.province } : {}),
      ...(query.region ? { regions: { has: query.region } } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };

    const [items, totalItems] = await shippingZonesRepository.findMany(
      where,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );

    return buildPaginatedResult(
      items.map(toZoneDto),
      totalItems,
      pagination
    );
  },

  async getById(id: string) {
    const zone = await shippingZonesRepository.findById(id);
    if (!zone) throw new NotFoundError("Zone de livraison");
    return toZoneDto(zone);
  },

  async create(input: CreateShippingZoneInput) {
    const existing = await shippingZonesRepository.findByName(input.name);
    if (existing) {
      throw new ConflictError("Une zone avec ce nom existe déjà.");
    }

    const zone = await shippingZonesRepository.create({
      name: input.name,
      province: input.province,
      regions: input.regions,
      basePrice: input.basePrice,
      pricePerKg: input.pricePerKg,
      estimatedDays: input.estimatedDays,
      isActive: input.isActive,
    });

    return toZoneDto(zone);
  },

  async update(id: string, input: UpdateShippingZoneInput) {
    const zone = await shippingZonesRepository.findById(id);
    if (!zone) throw new NotFoundError("Zone de livraison");

    // Vérifie l'unicité du nom si modifié
    if (input.name && input.name !== zone.name) {
      const existing = await shippingZonesRepository.findByName(input.name);
      if (existing && existing.id !== id) {
        throw new ConflictError("Une zone avec ce nom existe déjà.");
      }
    }

    const updated = await shippingZonesRepository.update(id, {
      name: input.name,
      province: input.province,
      regions: input.regions,
      basePrice: input.basePrice,
      pricePerKg: input.pricePerKg,
      estimatedDays: input.estimatedDays,
      isActive: input.isActive,
    });

    return toZoneDto(updated);
  },

  async remove(id: string) {
    const zone = await shippingZonesRepository.findById(id);
    if (!zone) throw new NotFoundError("Zone de livraison");

    // Refuse la suppression si des commandes y sont rattachées
    const ordersCount = zone._count?.orders ?? 0;
    if (ordersCount > 0) {
      throw new ConflictError(
        `Impossible de supprimer : ${ordersCount} commande(s) utilisent cette zone. Désactivez-la plutôt.`
      );
    }

    await shippingZonesRepository.delete(id);
  },
};