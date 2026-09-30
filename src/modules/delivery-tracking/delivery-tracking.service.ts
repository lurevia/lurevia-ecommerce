import { trackingQueryService } from "./tracking-query.service";
import { courierService } from "./courier.service";

export { toPingDto, DELIVERABLE_STATUSES } from "./tracking.dto";

export const deliveryTrackingService = {
  ping: courierService.ping.bind(courierService),
  listMyDeliveries: courierService.listMyDeliveries.bind(courierService),
  getMyStats: courierService.getMyStats.bind(courierService),
  getLatest: trackingQueryService.getLatest.bind(trackingQueryService),
  getHistory: trackingQueryService.getHistory.bind(trackingQueryService),
};
