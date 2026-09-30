import { describe, it, expect } from "vitest";
import {
  initiatePaymentSchema,
  listTransactionsQuerySchema,
  providerParamsSchema,
  refundSchema,
  transactionIdParamsSchema,
} from "../src/modules/payments/payments.validators";

describe("Payment Validators", () => {
  describe("initiatePaymentSchema", () => {
    it("should accept valid payment input for MVola", () => {
      const input = {
        orderId: "550e8400-e29b-41d4-a716-446655440000",
        provider: "MVOLA",
        phoneNumber: "0341234567",
      };
      const result = initiatePaymentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept valid payment input for Orange Money", () => {
      const input = {
        orderId: "550e8400-e29b-41d4-a716-446655440000",
        provider: "ORANGE_MONEY",
        phoneNumber: "0321234567",
      };
      const result = initiatePaymentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept valid payment input for Airtel Money with +261 format", () => {
      const input = {
        orderId: "550e8400-e29b-41d4-a716-446655440000",
        provider: "AIRTEL_MONEY",
        phoneNumber: "+261331234567",
      };
      const result = initiatePaymentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid orderId (non-uuid)", () => {
      const input = {
        orderId: "invalid-id",
        provider: "MVOLA",
        phoneNumber: "0341234567",
      };
      const result = initiatePaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject invalid phone number format", () => {
      const input = {
        orderId: "550e8400-e29b-41d4-a716-446655440000",
        provider: "MVOLA",
        phoneNumber: "0123456789",
      };
      const result = initiatePaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject invalid provider", () => {
      const input = {
        orderId: "550e8400-e29b-41d4-a716-446655440000",
        provider: "UNKNOWN_PROVIDER",
        phoneNumber: "0341234567",
      };
      const result = initiatePaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("listTransactionsQuerySchema", () => {
    it("should parse pagination and filters with defaults", () => {
      const query = { page: "2", limit: "15", status: "SUCCESS", provider: "MVOLA" };
      const parsed = listTransactionsQuerySchema.parse(query);
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(15);
      expect(parsed.status).toBe("SUCCESS");
      expect(parsed.provider).toBe("MVOLA");
    });

    it("should accept empty query", () => {
      const parsed = listTransactionsQuerySchema.parse({});
      expect(parsed).toBeDefined();
    });
  });

  describe("refundSchema", () => {
    it("should accept valid refund reason", () => {
      const valid = { reason: "Article défectueux retourné par le client" };
      expect(refundSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject reason that is too short", () => {
      const invalid = { reason: "ab" };
      expect(refundSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("providerParamsSchema & transactionIdParamsSchema", () => {
    it("should validate provider param", () => {
      expect(providerParamsSchema.safeParse({ provider: "MVOLA" }).success).toBe(true);
      expect(providerParamsSchema.safeParse({ provider: "INVALID" }).success).toBe(false);
    });

    it("should validate transactionId param", () => {
      expect(
        transactionIdParamsSchema.safeParse({
          transactionId: "550e8400-e29b-41d4-a716-446655440000",
        }).success
      ).toBe(true);
      expect(
        transactionIdParamsSchema.safeParse({ transactionId: "not-a-uuid" }).success
      ).toBe(false);
    });
  });
});
