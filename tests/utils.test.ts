import { describe, it, expect, vi } from "vitest";
import {
  generateOrderNumber,
  generateTransactionReference,
  generateIdempotencyKey,
} from "../src/utils/orderNumber";
import {
  isValidBid,
  shouldExtendAuction,
  isReserveMet,
} from "../src/utils/auction";
import { formatAriary, parseAriary } from "../src/utils/currency";
import {
  normalizeMalagasyPhone,
  detectMobileMoneyProvider,
} from "../src/utils/phone";
import { hashPassword, verifyPassword } from "../src/utils/password";
import { generateOtp } from "../src/utils/otp";
import { haversineDistance } from "../src/utils/geo";
import { generateUniqueProductSlug } from "../src/utils/slug";
import { prisma } from "../src/lib/prisma";

describe("Utility Functions", () => {
  describe("orderNumber utils", () => {
    it("generateOrderNumber should produce valid LUR-YYYY-XXXXXX format", () => {
      const orderNum = generateOrderNumber();
      expect(orderNum).toMatch(/^LUR-\d{4}-[A-Z0-9]{6}$/);
    });

    it("generateTransactionReference should produce TXN- format", () => {
      const ref = generateTransactionReference();
      expect(ref).toMatch(/^TXN-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it("generateIdempotencyKey should produce a valid UUID", () => {
      const key = generateIdempotencyKey();
      expect(key).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe("auction utils", () => {
    it("isValidBid validates minimum bid increments", () => {
      expect(
        isValidBid({ proposedPrice: 10000, currentPrice: null, startPrice: 10000 })
      ).toEqual({ valid: true });

      expect(
        isValidBid({ proposedPrice: 9000, currentPrice: null, startPrice: 10000 })
      ).toEqual(expect.objectContaining({ valid: false }));

      expect(
        isValidBid({
          proposedPrice: 16000,
          currentPrice: 15000,
          startPrice: 10000,
          minIncrement: 1000,
        })
      ).toEqual({ valid: true });

      expect(
        isValidBid({
          proposedPrice: 15500,
          currentPrice: 15000,
          startPrice: 10000,
          minIncrement: 1000,
        })
      ).toEqual(expect.objectContaining({ valid: false }));
    });

    it("shouldExtendAuction checks anti-snipe threshold", () => {
      const now = Date.now();
      const endingVerySoon = new Date(now + 60 * 1000);
      const endingLater = new Date(now + 10 * 60 * 1000);

      expect(shouldExtendAuction(endingVerySoon).extend).toBe(true);
      expect(shouldExtendAuction(endingLater).extend).toBe(false);
    });

    it("isReserveMet checks reserve price", () => {
      expect(isReserveMet(10000, null)).toBe(true);
      expect(isReserveMet(10000, 15000)).toBe(false);
      expect(isReserveMet(15000, 15000)).toBe(true);
    });
  });

  describe("currency utils", () => {
    it("formatAriary formats numbers nicely with Ar suffix", () => {
      const formatted = formatAriary(1250000);
      expect(formatted).toContain("1 250 000");
      expect(formatted).toContain("Ar");
    });

    it("parseAriary parses clean integer amount", () => {
      expect(parseAriary("1 250 000 Ar")).toBe(1250000);
      expect(parseAriary(50000)).toBe(50000);
    });

    it("parseAriary throws error on decimal amount", () => {
      expect(() => parseAriary(1250.5)).toThrow(
        "Le montant doit être un entier (pas de centimes en Ariary)"
      );
    });
  });

  describe("phone utils", () => {
    it("normalizes malagasy phone numbers to +261 format across formats", () => {
      expect(normalizeMalagasyPhone("034 12 345 67")).toBe("+261341234567");
      expect(normalizeMalagasyPhone("261341234567")).toBe("+261341234567");
      expect(normalizeMalagasyPhone("+261321234567")).toBe("+261321234567");
      expect(normalizeMalagasyPhone("invalid")).toBeNull();
    });

    it("detectMobileMoneyProvider identifies operators", () => {
      expect(detectMobileMoneyProvider("034 12 345 67")).toBe("MVOLA");
      expect(detectMobileMoneyProvider("038 12 345 67")).toBe("MVOLA");
      expect(detectMobileMoneyProvider("032 12 345 67")).toBe("ORANGE_MONEY");
      expect(detectMobileMoneyProvider("037 12 345 67")).toBe("ORANGE_MONEY");
      expect(detectMobileMoneyProvider("033 12 345 67")).toBe("AIRTEL_MONEY");
      expect(detectMobileMoneyProvider("invalid")).toBeNull();
    });
  });

  describe("slug utils", () => {
    it("generateUniqueProductSlug generates unique slug with collision avoidance", async () => {
      vi.spyOn(prisma.product, "findUnique")
        .mockResolvedValueOnce({ id: "p1", slug: "panier-art" } as any)
        .mockResolvedValueOnce(null);

      const slug = await generateUniqueProductSlug("Panier Art");
      expect(slug).toBe("panier-art-2");
    });

    it("generateUniqueProductSlug returns slug directly if no conflict", async () => {
      vi.spyOn(prisma.product, "findUnique").mockResolvedValueOnce(null);

      const slug = await generateUniqueProductSlug("Chapeau Raphia");
      expect(slug).toBe("chapeau-raphia");
    });
  });

  describe("password utils", () => {
    it("hashes and verifies passwords", async () => {
      const hash = await hashPassword("super_secure_password");
      expect(hash).not.toBe("super_secure_password");
      const isValid = await verifyPassword("super_secure_password", hash);
      expect(isValid).toBe(true);
      const isInvalid = await verifyPassword("wrong_password", hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe("otp & geo utils", () => {
    it("generateOtp produces 6-digit numeric OTP", () => {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it("haversineDistance calculates approximate distance in km", () => {
      const dist = haversineDistance(-18.91, 47.52, -18.92, 47.52);
      expect(dist).toBeGreaterThan(1.0);
      expect(dist).toBeLessThan(1.2);
    });
  });
});
