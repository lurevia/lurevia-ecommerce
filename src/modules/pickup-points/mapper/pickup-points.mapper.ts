import { type PickupPointWithRelations } from "../lib/type/pickup-points.type";

export class PickupPointsMapper {
  toOutput(p: PickupPointWithRelations) {
    return {
      id: p.id,
      name: p.name,
      provider: p.provider,
      phone: p.phone,
      email: p.email,
      province: p.province,
      region: p.region,
      city: p.city,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      shippingZone: p.shippingZone ?? null,
      isActive: p.isActive,
      addressesCount: p._count?.addresses ?? 0,
      ordersCount: p._count?.orders ?? 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  toOutputList(items: PickupPointWithRelations[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const pickupPointsMapper = new PickupPointsMapper();
