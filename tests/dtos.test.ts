import { describe, it, expect } from "vitest";
import {
  toFeedbackDto,
  CATEGORY_TO_DB,
  CATEGORY_TO_API,
} from "../src/modules/feedback/feedback.dto";
import { toPickupPointDto } from "../src/modules/pickup-points/pickup-points.dto";
import { toPingDto } from "../src/modules/delivery-tracking/tracking.dto";

describe("Domain DTOs and Mappers", () => {
  describe("Feedback DTO", () => {
    it("converts feedback entity to API DTO", () => {
      const now = new Date();
      const entity = {
        id: "fb-1",
        userId: "user-1",
        overallRating: 5,
        criteria: { speed: 5 },
        category: "DELIVERY" as const,
        comment: "Livraison rapide et soignée",
        teamResponse: "Merci !",
        isApproved: true,
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
        user: { fullName: "Aina R.", avatarUrl: "https://avatar.com/1" },
      };

      const dto = toFeedbackDto(entity);
      expect(dto.id).toBe("fb-1");
      expect(dto.userName).toBe("Aina R.");
      expect(dto.category).toBe("delivery");
      expect(dto.overallRating).toBe(5);
      expect(dto.isApproved).toBe(true);
      expect(dto.teamResponse).toBe("Merci !");
    });

    it("verifies category bidirectional mapping", () => {
      expect(CATEGORY_TO_DB["delivery"]).toBe("DELIVERY");
      expect(CATEGORY_TO_API["DELIVERY"]).toBe("delivery");
    });
  });

  describe("Pickup Points DTO", () => {
    it("converts pickup point entity to DTO", () => {
      const now = new Date();
      const entity = {
        id: "pp-1",
        name: "Relais Colis Analakely",
        provider: "COLIS_EXPRESS",
        phone: "0341122334",
        email: "relais@express.mg",
        province: "ANTANANARIVO" as const,
        region: "ANALAMANGA" as const,
        city: "Antananarivo",
        address: "12 Avenue de l'Indépendance",
        latitude: -18.91,
        longitude: 47.52,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        shippingZoneId: "sz-1",
        shippingZone: { id: "sz-1", name: "Tana Ville", basePrice: 5000, estimatedDays: 1 },
        _count: { addresses: 3, orders: 12 },
      };

      const dto = toPickupPointDto(entity);
      expect(dto.id).toBe("pp-1");
      expect(dto.name).toBe("Relais Colis Analakely");
      expect(dto.addressesCount).toBe(3);
      expect(dto.ordersCount).toBe(12);
      expect(dto.shippingZone?.name).toBe("Tana Ville");
    });
  });

  describe("Delivery Tracking DTO", () => {
    it("converts ping to DTO with courier info", () => {
      const now = new Date();
      const loc = {
        id: "loc-1",
        orderId: "ord-1",
        courierId: "c-1",
        latitude: -18.91,
        longitude: 47.52,
        accuracy: 5,
        speed: 35.5,
        heading: 180,
        recordedAt: now,
        courier: {
          id: "c-1",
          fullName: "Jean Livro",
          avatarUrl: null,
          phone: "0349988776",
        },
      };

      const dto = toPingDto(loc);
      expect(dto.id).toBe("loc-1");
      expect(dto.latitude).toBe(-18.91);
      expect(dto.longitude).toBe(47.52);
      expect(dto.accuracy).toBe(5);
      expect(dto.speed).toBe(35.5);
      expect(dto.courier?.fullName).toBe("Jean Livro");
    });
  });
});
