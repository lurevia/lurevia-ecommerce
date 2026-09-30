import { describe, it, expect, vi, beforeEach } from "vitest";
import { paymentsController } from "../src/modules/payments/payments.controller";
import { paymentsService } from "../src/modules/payments/payments.service";

describe("Payments Controller", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it("initiate calls paymentsService.initiate and returns 201", async () => {
    const req: any = {
      user: { id: "user-123" },
      body: { orderId: "ord-1", provider: "MVOLA", phoneNumber: "0341234567" },
    };
    const res = mockRes();
    const next = vi.fn();

    vi.spyOn(paymentsService, "initiate").mockResolvedValueOnce({
      id: "tx-1",
    } as any);

    await paymentsController.initiate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: { transaction: { id: "tx-1" } },
    });
  });

  it("getById calls paymentsService.getById and returns 200", async () => {
    const req: any = {
      user: { id: "user-123" },
      params: { transactionId: "tx-1" },
    };
    const res = mockRes();
    const next = vi.fn();

    vi.spyOn(paymentsService, "getById").mockResolvedValueOnce({
      id: "tx-1",
    } as any);

    await paymentsController.getById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { transaction: { id: "tx-1" } },
    });
  });

  it("listMine calls paymentsService.listMine and returns 200", async () => {
    const req: any = {
      user: { id: "user-123" },
      query: { page: "1", limit: "10" },
    };
    const res = mockRes();
    const next = vi.fn();

    const mockPaginated = {
      items: [],
      pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false },
    };
    vi.spyOn(paymentsService, "listMine").mockResolvedValueOnce(mockPaginated as any);

    await paymentsController.listMine(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: mockPaginated,
    });
  });

  it("webhook calls paymentsService.handleWebhook and returns 200", async () => {
    const req: any = {
      params: { provider: "MVOLA" },
      body: { externalId: "ext-1", status: "SUCCESS" },
      headers: { "x-signature": "sig-123" },
    };
    const res = mockRes();
    const next = vi.fn();

    vi.spyOn(paymentsService, "handleWebhook").mockResolvedValueOnce({
      handled: true,
      status: "SUCCESS",
    } as any);

    await paymentsController.webhook(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { handled: true, status: "SUCCESS" },
    });
  });

  it("refund calls paymentsService.refund and returns 200", async () => {
    const req: any = {
      params: { transactionId: "tx-1" },
      body: { reason: "Article défectueux retourné" },
    };
    const res = mockRes();
    const next = vi.fn();

    vi.spyOn(paymentsService, "refund").mockResolvedValueOnce({
      id: "tx-1",
      status: "REFUNDED",
    } as any);

    await paymentsController.refund(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { transaction: { id: "tx-1", status: "REFUNDED" } },
    });
  });
});
