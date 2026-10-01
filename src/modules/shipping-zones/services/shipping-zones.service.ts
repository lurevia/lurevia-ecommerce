import { shippingZonesRepository, type ShippingZonesRepository } from "../repository/shipping-zones.repository";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import type { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";
import type { CreateShippingZoneInput, ListZonesQuery, UpdateShippingZoneInput } from "../dto";
import { shippingZonesMapper } from "../mapper/shipping-zones.mapper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class ShippingZonesService {
    constructor(
        private readonly repository: ShippingZonesRepository
    ) { }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Liste publique des zones actives.
     * Utilisé par la page "Livraison" et le calculateur côté front.
     */
    async listPublic() {
        return this.repository.findActive();
    }

    /**
     * Cherche la zone applicable pour une région donnée.
     * Fallback sur la province si aucune zone ne couvre la région exacte.
     *
     * Utilisé par `ordersService.computeShippingCost`.
     */
    async findForRegion(
        region: RegionMadagascar,
        province: ProvinceMadagascar
    ): Promise<{ cost: number; zoneId?: string; estimatedDays?: number; }> {
        // 1. Essaie la région exacte
        const exact = await this.repository.findByRegion(region);
        if (exact) {
            return {
                cost: exact.basePrice,
                zoneId: exact.id,
                estimatedDays: exact.estimatedDays ?? undefined,
            };
        }

        // 2. Fallback sur la province
        const byProvince = await this.repository.findByProvince(province);
        if (byProvince) {
            return {
                cost: byProvince.basePrice,
                zoneId: byProvince.id,
                estimatedDays: byProvince.estimatedDays ?? undefined,
            };
        }

        // 3. Aucune zone : renvoie coût 0 (le service appelant met le défaut)
        return { cost: 0 };
    }

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

        const [items, totalItems] = await this.repository.findMany(
            where,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );

        return buildPaginatedResult(
            shippingZonesMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    async getById(id: string) {
        const zone = await this.repository.findById(id);
        if (!zone) throw new NotFoundError("Zone de livraison");
        return shippingZonesMapper.toOutput(zone);
    }

    async create(input: CreateShippingZoneInput) {
        const existing = await this.repository.findByName(input.name);
        if (existing) {
            throw new ConflictError("Une zone avec ce nom existe déjà.");
        }

        const zone = await this.repository.create({
            name: input.name,
            province: input.province,
            regions: input.regions,
            basePrice: input.basePrice,
            pricePerKg: input.pricePerKg,
            estimatedDays: input.estimatedDays,
            isActive: input.isActive,
        });

        return shippingZonesMapper.toOutput(zone);
    }

    async update(id: string, input: UpdateShippingZoneInput) {
        const zone = await this.repository.findById(id);
        if (!zone) throw new NotFoundError("Zone de livraison");

        // Vérifie l'unicité du nom si modifié
        if (input.name && input.name !== zone.name) {
            const existing = await this.repository.findByName(input.name);
            if (existing && existing.id !== id) {
                throw new ConflictError("Une zone avec ce nom existe déjà.");
            }
        }

        const updated = await this.repository.update(id, {
            name: input.name,
            province: input.province,
            regions: input.regions,
            basePrice: input.basePrice,
            pricePerKg: input.pricePerKg,
            estimatedDays: input.estimatedDays,
            isActive: input.isActive,
        });

        return shippingZonesMapper.toOutput(updated);
    }

    async remove(id: string) {
        const zone = await this.repository.findById(id);
        if (!zone) throw new NotFoundError("Zone de livraison");

        // Refuse la suppression si des commandes y sont rattachées
        const ordersCount = zone._count?.orders ?? 0;
        if (ordersCount > 0) {
            throw new ConflictError(
                `Impossible de supprimer : ${ordersCount} commande(s) utilisent cette zone. Désactivez-la plutôt.`
            );
        }

        await this.repository.delete(id);
    }
}

export const shippingZonesService = new ShippingZonesService(shippingZonesRepository);
