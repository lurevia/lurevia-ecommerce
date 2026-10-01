import { trackingQueryService, type TrackingQueryService } from "./tracking-query.service";
import { courierService, type CourierService } from "./courier.service";

export class DeliveryTrackingService {
    constructor(
        private readonly trackingQueryService: TrackingQueryService,
        private readonly courierService: CourierService
    ) { }

    ping(...args: Parameters<CourierService["ping"]>) {
        return this.courierService.ping(...args);
    }

    listMyDeliveries(...args: Parameters<CourierService["listMyDeliveries"]>) {
        return this.courierService.listMyDeliveries(...args);
    }

    getMyStats(...args: Parameters<CourierService["getMyStats"]>) {
        return this.courierService.getMyStats(...args);
    }

    getLatest(...args: Parameters<TrackingQueryService["getLatest"]>) {
        return this.trackingQueryService.getLatest(...args);
    }

    getHistory(...args: Parameters<TrackingQueryService["getHistory"]>) {
        return this.trackingQueryService.getHistory(...args);
    }
}

export const deliveryTrackingService = new DeliveryTrackingService(trackingQueryService, courierService);
