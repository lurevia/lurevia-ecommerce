import { type ZoneWithCounts } from "../lib/type/shipping-zones.type";

export class ShippingZonesMapper {
  toOutput(zone: ZoneWithCounts) {
    return {
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
    };
  }

  toOutputList(items: ZoneWithCounts[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const shippingZonesMapper = new ShippingZonesMapper();
