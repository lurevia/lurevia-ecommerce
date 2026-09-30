import { describe, it, expect, vi, beforeEach } from "vitest";
import { paymentsService } from "../src/modules/payments/payments.service";
import { paymentsRepository } from "../src/modules/payments/payments.repository";
import { prisma } from "../src/lib/prisma";
import * as operators from "../src/modules/payments/payments.operators";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../src/errors/AppError";

describe("Payments Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("initiate", () => {
    const userId = "user-123";
    const input = {
      orderId: "order-123",
      provider: "MVOLA" as const,
      phoneNumber: "0341234567",
    };

    it("should throw NotFoundError if order does not exist", async () => {
      vi.spyOn(prisma.order, "findUnique").mockResolvedValueOnce(null);

      await expect(paymentsService.initiate(userId, input)).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw ForbiddenError if order does not belong to user", async () => {
      vi.spyOn(prisma.order, "findUnique").mockResolvedValueOnce({
        id: "order-123",
        userId: "different-user",
        status: "PENDING",
      } as any);

      await expect(paymentsService.initiate(userId, input)).rejects.toThrow(
        ForbiddenError
      );
    });

    it("should throw ConflictError if order is not PENDING or COD_PENDING", async () => {
      vi.spyOn(prisma.order, "findUnique").mockResolvedValueOnce({
        id: "order-123",
        userId,
        status: "PAID",
      } as any);

      await expect(paymentsService.initiate(userId, input)).rejects.toThrow(
        ConflictError
      );
    });

    it("should throw ConflictError if operator is not configured", async () => {
      vi.spyOn(prisma.order, "findUnique").mockResolvedValueOnce({
        id: "order-123",
        userId,
        status: "PENDING",
      } as any);

      vi.spyOn(operators, "isOperatorConfigured").mockReturnValueOnce(false);

      await expect(paymentsService.initiate(userId, input)).rejects.toThrow(
        ConflictError
      );
    });

    it("should return existing transaction if already initiated or pending", async () => {
      vi.spyOn(prisma.order, "findUnique").mockResolvedValueOnce({
        id: "order-123",
        userId,
        status: "PENDING",
      } as any);

      vi.spyOn(prisma.transaction, "findFirst").mockResolvedValueOnce({
        id: "tx-existing",
      } as any);

      const mockFull = {
        id: "tx-existing",
        orderId: "order-123",
        amount: 20000,
        currency: "MGA",
        method: "MOBILE_MONEY",
        provider: "MVOLA",
        status: "INITIATED",
        idempotencyKey: "idem",
        externalRequestId: "ext",
        createdAt: new Date(),
        updatedAt: new Date(),
        order: { id: "order-123", orderNumber: "ORD-1", status: "PENDING", total: 20000, currency: "MGA" },
      };
      vi.spyOn(paymentsRepository, "findById").mockResolvedValueOnce(mockFull as any);

      const res = await paymentsService.initiate(userId, input);
      expect(res.id).toBe("tx-existing");
    });

    it("should create transaction and call operator API", async () => {
      vi.spyOn(prisma.order, "findUnique").mockResolvedValueOnce({
        id: "order-123",
        userId,
        status: "PENDING",
        total: 50000,
        currency: "MGA",
        orderNumber: "ORD-123",
      } as any);

      vi.spyOn(prisma.transaction, "findFirst").mockResolvedValueOnce(null);

      vi.spyOn(paymentsRepository, "create").mockResolvedValueOnce({
        id: "tx-new",
      } as any);

      const callOpSpy = vi
        .spyOn(operators, "callOperatorApi")
        .mockResolvedValueOnce(undefined);

      const mockFull = {
        id: "tx-new",
        orderId: "order-123",
        amount: 50000,
        currency: "MGA",
        method: "MOBILE_MONEY",
        provider: "MVOLA",
        status: "INITIATED",
        idempotencyKey: "idem",
        externalRequestId: "ext",
        createdAt: new Date(),
        updatedAt: new Date(),
        order: { id: "order-123", orderNumber: "ORD-123", status: "PENDING", total: 50000, currency: "MGA" },
      };
      vi.spyOn(paymentsRepository, "findById").mockResolvedValueOnce(mockFull as any);

      const res = await paymentsService.initiate(userId, input);
      expect(res.id).toBe("tx-new");
      expect(callOpSpy).toHaveBeenCalled();
    });

    it("should update status to FAILED and throw ConflictError if callOperatorApi fails", async () => {
      vi.spyOn(prisma.order, "findUnique").mockResolvedValueOnce({
        id: "order-123",
        userId,
        status: "PENDING",
        total: 50000,
        currency: "MGA",
        orderNumber: "ORD-123",
      } as any);

      vi.spyOn(prisma.transaction, "findFirst").mockResolvedValueOnce(null);
      vi.spyOn(paymentsRepository, "create").mockResolvedValueOnce({
        id: "tx-new",
      } as any);

      vi.spyOn(operators, "callOperatorApi").mockRejectedValueOnce(new Error("Network error"));
      const updateStatusSpy = vi
        .spyOn(paymentsRepository, "updateStatus")
        .mockResolvedValueOnce({} as any);

      await expect(paymentsService.initiate(userId, input)).rejects.toThrow(
        ConflictError
      );
      expect(updateStatusSpy).toHaveBeenCalledWith("tx-new", expect.objectContaining({ status: "FAILED" }));
    });
  });

  describe("getById", () => {
    it("should throw NotFoundError if transaction not found", async () => {
      vi.spyOn(paymentsRepository, "findById").mockResolvedValueOnce(null);

      await expect(paymentsService.getById("u1", "tx-999")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw ForbiddenError if transaction does not belong to user", async () => {
      vi.spyOn(paymentsRepository, "findById").mockResolvedValueOnce({
        id: "tx-1",
        order: { userId: "different-user" },
      } as any);

      await expect(paymentsService.getById("u1", "tx-1")).rejects.toThrow(
        ForbiddenError
      );
    });

    it("should return DTO if transaction is found and belongs to user", async () => {
      vi.spyOn(paymentsRepository, "findById").mockResolvedValueOnce({
        id: "tx-1",
        amount: 10000,
        currency: "MGA",
        method: "MOBILE_MONEY",
        provider: "MVOLA",
        status: "SUCCESS",
        orderId: "ord-1",
        idempotencyKey: "k",
        externalRequestId: "r",
        createdAt: new Date(),
        updatedAt: new Date(),
        order: { id: "ord-1", userId: "u1", orderNumber: "ORD", status: "PAID", total: 10000, currency: "MGA" },
      } as any);

      const res = await paymentsService.getById("u1", "tx-1");
      expect(res.id).toBe("tx-1");
    });
  });

  describe("listMine", () => {
    it("should return paginated transactions with mapped items", async () => {
      const mockTx = {
        id: "tx-1",
        amount: 10000,
        currency: "MGA",
        method: "MOBILE_MONEY",
        provider: "MVOLA",
        status: "SUCCESS",
        orderId: "ord-1",
        idempotencyKey: "k",
        externalRequestId: "r",
        createdAt: new Date(),
        updatedAt: new Date(),
        order: { id: "ord-1", orderNumber: "ORD", status: "PAID", total: 10000, currency: "MGA" },
      };
      vi.spyOn(paymentsRepository, "findManyByUser").mockResolvedValueOnce([
        [mockTx as any],
        1,
      ]);

      const res = await paymentsService.listMine("u1", { page: 1, limit: 10 });
      expect(res.items.length).toBe(1);
      expect(res.items[0].id).toBe("tx-1");
      expect(res.pagination.totalItems).toBe(1);
    });

    it("should return empty paginated result when no transactions exist", async () => {
      vi.spyOn(paymentsRepository, "findManyByUser").mockResolvedValueOnce([
        [],
        0,
      ]);

      const res = await paymentsService.listMine("u1", { page: 1, limit: 10 });
      expect(res.items).toEqual([]);
      expect(res.pagination.totalItems).toBe(0);
    });
  });

  describe("handleWebhook", () => {
    it("should reject webhook with invalid signature", async () => {
      vi.spyOn(operators, "verifyWebhookSignature").mockReturnValueOnce(false);
      vi.spyOn(paymentsRepository, "createWebhook").mockResolvedValueOnce({ id: "wh-1" } as any);
      vi.spyOn(paymentsRepository, "markWebhookProcessed").mockResolvedValueOnce({} as any);

      await expect(
        paymentsService.handleWebhook("MVOLA", { externalId: "ext" }, "invalid-sig")
      ).rejects.toThrow(ForbiddenError);
    });

    it("should return unknown_transaction if transaction not found", async () => {
      vi.spyOn(operators, "verifyWebhookSignature").mockReturnValueOnce(true);
      vi.spyOn(paymentsRepository, "createWebhook").mockResolvedValueOnce({ id: "wh-1" } as any);
      vi.spyOn(paymentsRepository, "findByExternalId").mockResolvedValueOnce(null);
      vi.spyOn(paymentsRepository, "markWebhookProcessed").mockResolvedValueOnce({} as any);

      const res = await paymentsService.handleWebhook(
        "MVOLA",
        { externalId: "unknown-ext" },
        "valid-sig"
      );
      expect(res.handled).toBe(false);
      expect(res.reason).toBe("unknown_transaction");
    });

    it("should return alreadyProcessed if transaction already SUCCESS or FAILED", async () => {
      vi.spyOn(operators, "verifyWebhookSignature").mockReturnValueOnce(true);
      vi.spyOn(paymentsRepository, "createWebhook").mockResolvedValueOnce({ id: "wh-1" } as any);
      vi.spyOn(paymentsRepository, "findByExternalId").mockResolvedValueOnce({
        id: "tx-1",
        status: "SUCCESS",
      } as any);
      vi.spyOn(paymentsRepository, "markWebhookProcessed").mockResolvedValueOnce({} as any);

      const res = await paymentsService.handleWebhook(
        "MVOLA",
        { externalId: "ext-1" },
        "valid-sig"
      );
      expect(res.alreadyProcessed).toBe(true);
    });

    it("should process SUCCESS webhook and update order to PAID", async () => {
      vi.spyOn(operators, "verifyWebhookSignature").mockReturnValueOnce(true);
      vi.spyOn(paymentsRepository, "createWebhook").mockResolvedValueOnce({ id: "wh-1" } as any);
      vi.spyOn(paymentsRepository, "findByExternalId").mockResolvedValueOnce({
        id: "tx-1",
        orderId: "ord-1",
        status: "INITIATED",
      } as any);

      const txUpdateSpy = vi.fn();
      const orderUpdateSpy = vi.fn();
      vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (cb: any) => {
        return cb({
          transaction: { update: txUpdateSpy },
          order: { update: orderUpdateSpy },
        });
      });
      vi.spyOn(paymentsRepository, "markWebhookProcessed").mockResolvedValueOnce({} as any);

      const res = await paymentsService.handleWebhook(
        "MVOLA",
        { externalId: "ext-1", status: "SUCCESS" },
        "valid-sig"
      );
      expect(res.handled).toBe(true);
      expect(res.status).toBe("SUCCESS");
      expect(txUpdateSpy).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "SUCCESS" }) }));
      expect(orderUpdateSpy).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "PAID" }) }));
    });

    it("should process FAILED webhook and update order to PAYMENT_FAILED", async () => {
      vi.spyOn(operators, "verifyWebhookSignature").mockReturnValueOnce(true);
      vi.spyOn(paymentsRepository, "createWebhook").mockResolvedValueOnce({ id: "wh-2" } as any);
      vi.spyOn(paymentsRepository, "findByExternalId").mockResolvedValueOnce({
        id: "tx-2",
        orderId: "ord-2",
        status: "INITIATED",
      } as any);

      const txUpdateSpy = vi.fn();
      const orderUpdateSpy = vi.fn();
      vi.spyOn(prisma, "$transaction").mockImplementationOnce(async (cb: any) => {
        return cb({
          transaction: { update: txUpdateSpy },
          order: { update: orderUpdateSpy },
        });
      });
      vi.spyOn(paymentsRepository, "markWebhookProcessed").mockResolvedValueOnce({} as any);

      const res = await paymentsService.handleWebhook(
        "MVOLA",
        { externalId: "ext-2", status: "FAILED", message: "Solde insuffisant" },
        "valid-sig"
      );
      expect(res.handled).toBe(true);
      expect(res.status).toBe("FAILED");
      expect(txUpdateSpy).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "FAILED" }) }));
      expect(orderUpdateSpy).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "PAYMENT_FAILED" }) }));
    });
  });

  describe("refund", () => {
    it("should throw NotFoundError if transaction not found", async () => {
      vi.spyOn(paymentsRepository, "findById").mockResolvedValueOnce(null);

      await expect(
        paymentsService.refund("tx-x", { reason: "Article défectueux retourné" })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ConflictError if transaction status is not SUCCESS", async () => {
      vi.spyOn(paymentsRepository, "findById").mockResolvedValueOnce({
        id: "tx-x",
        status: "PENDING",
      } as any);

      await expect(
        paymentsService.refund("tx-x", { reason: "Article défectueux retourné" })
      ).rejects.toThrow(ConflictError);
    });

    it("should refund successfully when transaction is SUCCESS", async () => {
      const mockTx = {
        id: "tx-ok",
        orderId: "ord-ok",
        status: "SUCCESS",
        amount: 25000,
        currency: "MGA",
        method: "MOBILE_MONEY",
        provider: "MVOLA",
        idempotencyKey: "k",
        externalRequestId: "r",
        createdAt: new Date(),
        updatedAt: new Date(),
        order: { id: "ord-ok", orderNumber: "ORD-OK", status: "PAID", total: 25000, currency: "MGA" },
      };
      vi.spyOn(paymentsRepository, "findById").mockResolvedValue(mockTx as any);
      vi.spyOn(paymentsRepository, "updateStatus").mockResolvedValueOnce({} as any);
      vi.spyOn(prisma.order, "update").mockResolvedValueOnce({} as any);

      const res = await paymentsService.refund("tx-ok", { reason: "Article défectueux retourné" });
      expect(res.id).toBe("tx-ok");
    });
  });
});
