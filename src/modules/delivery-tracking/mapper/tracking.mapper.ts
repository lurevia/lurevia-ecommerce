import { type PingWithCourier } from "../lib/type/delivery-tracking.type";

export class TrackingMapper {
  toOutput(p: PingWithCourier) {
    return {
      id: p.id,
      orderId: p.orderId,
      latitude: p.latitude,
      longitude: p.longitude,
      accuracy: p.accuracy,
      speed: p.speed,
      heading: p.heading,
      recordedAt: p.recordedAt,
      courier: p.courier
        ? {
          id: p.courier.id,
          fullName: p.courier.fullName,
          avatarUrl: p.courier.avatarUrl,
          phone: p.courier.phone,
        }
        : null,
    };
  }

  toOutputList(items: PingWithCourier[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const trackingMapper = new TrackingMapper();
