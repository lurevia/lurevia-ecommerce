import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import crypto from "node:crypto";
import { callMvolaApi } from "../src/modules/payments/operators/mvola.operator";
import { callOrangeMoneyApi } from "../src/modules/payments/operators/orange-money.operator";
import { callAirtelMoneyApi } from "../src/modules/payments/operators/airtel-money.operator";
import { verifyWebhookSignature } from "../src/modules/payments/operators/signature";
import {
  isOperatorConfigured,
  callOperatorApi,
  OPERATOR_CONFIG,
} from "../src/modules/payments/payments.operators";

describe("Payment Operators", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("MVola Operator", () => {
    it("should successfully initiate MVola payment when token and transaction succeed", async () => {
      const axiosPostSpy = vi
        .spyOn(axios, "post")
        .mockResolvedValueOnce({ data: { access_token: "mock_mvola_token" } })
        .mockResolvedValueOnce({ data: { transactionId: "TX-MVOLA-123" } });

      await expect(
        callMvolaApi({
          apiUrl: "https://sandbox.mvola.mg",
          apiKey: "test_key",
          apiSecret: "test_secret",
          callbackUrl: "https://callback.com",
          phoneNumber: "0340000001",
          amount: 50000,
          externalRequestId: "REQ-001",
          orderNumber: "CMD-001",
        })
      ).resolves.toBeUndefined();

      expect(axiosPostSpy).toHaveBeenCalledTimes(2);
      expect(axiosPostSpy.mock.calls[0][0]).toBe("https://sandbox.mvola.mg/token");
      expect(axiosPostSpy.mock.calls[1][0]).toBe(
        "https://sandbox.mvola.mg/mvola/mm/transactions/type/merchantpay/1.0.0"
      );
    });

    it("should throw error when MVola access token is missing", async () => {
      vi.spyOn(axios, "post").mockResolvedValueOnce({ data: {} });

      await expect(
        callMvolaApi({
          apiUrl: "https://sandbox.mvola.mg",
          apiKey: "test_key",
          apiSecret: "test_secret",
          phoneNumber: "0340000001",
          amount: 50000,
          externalRequestId: "REQ-001",
          orderNumber: "CMD-001",
        })
      ).rejects.toThrow("MVola : impossible d'obtenir le token d'accès.");
    });
  });

  describe("Orange Money Operator", () => {
    it("should successfully initiate Orange Money payment", async () => {
      const axiosPostSpy = vi
        .spyOn(axios, "post")
        .mockResolvedValueOnce({ data: { access_token: "mock_om_token" } })
        .mockResolvedValueOnce({
          data: { payment_url: "https://orange.com/pay", notif_token: "notif_123" },
        });

      await expect(
        callOrangeMoneyApi({
          apiUrl: "https://api.orange.com",
          apiKey: "om_key",
          apiSecret: "om_secret",
          callbackUrl: "https://callback.com",
          phoneNumber: "0320000002",
          amount: 75000,
          externalRequestId: "REQ-OM-002",
          orderNumber: "CMD-OM-002",
        })
      ).resolves.toBeUndefined();

      expect(axiosPostSpy).toHaveBeenCalledTimes(2);
      expect(axiosPostSpy.mock.calls[0][0]).toBe("https://api.orange.com/oauth/v3/token");
      expect(axiosPostSpy.mock.calls[1][0]).toBe("https://api.orange.com/webpayment");
    });

    it("should throw error when Orange Money token is missing", async () => {
      vi.spyOn(axios, "post").mockResolvedValueOnce({ data: {} });

      await expect(
        callOrangeMoneyApi({
          apiUrl: "https://api.orange.com",
          apiKey: "om_key",
          apiSecret: "om_secret",
          phoneNumber: "0320000002",
          amount: 75000,
          externalRequestId: "REQ-OM-002",
          orderNumber: "CMD-OM-002",
        })
      ).rejects.toThrow("Orange Money : impossible d'obtenir le token d'accès.");
    });
  });

  describe("Airtel Money Operator", () => {
    it("should successfully initiate Airtel Money payment and strip phone prefix", async () => {
      const axiosPostSpy = vi
        .spyOn(axios, "post")
        .mockResolvedValueOnce({ data: { access_token: "mock_airtel_token" } })
        .mockResolvedValueOnce({
          data: { data: { transaction: { id: "TX-AIRTEL-999" } } },
        });

      await expect(
        callAirtelMoneyApi({
          apiUrl: "https://openapiuat.airtel.africa",
          apiKey: "airtel_key",
          apiSecret: "airtel_secret",
          callbackUrl: "https://callback.com",
          phoneNumber: "+261330000003",
          amount: 25000,
          externalRequestId: "REQ-AM-003",
          orderNumber: "CMD-AM-003",
        })
      ).resolves.toBeUndefined();

      expect(axiosPostSpy).toHaveBeenCalledTimes(2);
      expect(axiosPostSpy.mock.calls[0][0]).toBe("https://openapiuat.airtel.africa/auth/oauth2/token");
      expect(axiosPostSpy.mock.calls[1][0]).toBe("https://openapiuat.airtel.africa/merchant/v1/payments/");
      
      const payload = axiosPostSpy.mock.calls[1][1] as any;
      expect(payload.subscriber.msisdn).toBe("330000003");
    });

    it("should throw error when Airtel token is missing", async () => {
      vi.spyOn(axios, "post").mockResolvedValueOnce({ data: {} });

      await expect(
        callAirtelMoneyApi({
          apiUrl: "https://openapiuat.airtel.africa",
          apiKey: "airtel_key",
          apiSecret: "airtel_secret",
          phoneNumber: "0330000003",
          amount: 25000,
          externalRequestId: "REQ-AM-003",
          orderNumber: "CMD-AM-003",
        })
      ).rejects.toThrow("Airtel Money : impossible d'obtenir le token d'accès.");
    });
  });

  describe("Webhook Signature Verification", () => {
    const payload = { event: "PAYMENT_CONFIRMED", id: "123" };

    it("should verify valid signature correctly", async () => {
      const { env } = await import("../src/config/env");
      const secret =
        (typeof env[OPERATOR_CONFIG["MVOLA"].apiSecretKey] === "string" &&
          env[OPERATOR_CONFIG["MVOLA"].apiSecretKey]) ||
        "presentation_secret_key";
      const validSig = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const result = verifyWebhookSignature("MVOLA", payload, validSig);
      expect(result).toBe(true);
    });

    it("should return false if signature header is missing or empty", () => {
      expect(verifyWebhookSignature("MVOLA", payload, undefined)).toBe(false);
      expect(verifyWebhookSignature("MVOLA", payload, "")).toBe(false);
    });

    it("should return false for invalid signature content", () => {
      const invalidSig = "a".repeat(64);
      expect(verifyWebhookSignature("MVOLA", payload, invalidSig)).toBe(false);
    });

    it("should return false for malformed or mismatched length hex strings", () => {
      expect(verifyWebhookSignature("MVOLA", payload, "tooshort")).toBe(false);
      expect(verifyWebhookSignature("MVOLA", payload, "invalid_hex!@#$")).toBe(false);
    });
  });

  describe("Dispatcher & Operator Config", () => {
    it("should return true for configured operators with generic keys", () => {
      expect(isOperatorConfigured("MVOLA")).toBe(true);
      expect(isOperatorConfigured("ORANGE_MONEY")).toBe(true);
      expect(isOperatorConfigured("AIRTEL_MONEY")).toBe(true);
    });

    it("should dispatch callOperatorApi to MVOLA", async () => {
      vi.spyOn(axios, "post")
        .mockResolvedValueOnce({ data: { access_token: "tok1" } })
        .mockResolvedValueOnce({ data: { transactionId: "123" } });

      await expect(
        callOperatorApi({
          provider: "MVOLA",
          phoneNumber: "0341234567",
          amount: 10000,
          currency: "MGA",
          externalRequestId: "EXT1",
          orderNumber: "ORD1",
        })
      ).resolves.toBeUndefined();
    });

    it("should dispatch callOperatorApi to ORANGE_MONEY", async () => {
      vi.spyOn(axios, "post")
        .mockResolvedValueOnce({ data: { access_token: "tok2" } })
        .mockResolvedValueOnce({ data: { payment_url: "url", notif_token: "tok" } });

      await expect(
        callOperatorApi({
          provider: "ORANGE_MONEY",
          phoneNumber: "0321234567",
          amount: 20000,
          currency: "MGA",
          externalRequestId: "EXT2",
          orderNumber: "ORD2",
        })
      ).resolves.toBeUndefined();
    });

    it("should dispatch callOperatorApi to AIRTEL_MONEY", async () => {
      vi.spyOn(axios, "post")
        .mockResolvedValueOnce({ data: { access_token: "tok3" } })
        .mockResolvedValueOnce({ data: { data: { transaction: { id: "789" } } } });

      await expect(
        callOperatorApi({
          provider: "AIRTEL_MONEY",
          phoneNumber: "0331234567",
          amount: 30000,
          currency: "MGA",
          externalRequestId: "EXT3",
          orderNumber: "ORD3",
        })
      ).resolves.toBeUndefined();
    });
  });
});
