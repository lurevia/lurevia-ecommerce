import { describe, it, expect, vi, beforeEach } from "vitest";
import { paymentsRepository } from "../src/modules/payments/payments.repository";
import { prisma } from "../src/lib/prisma";

describe("Payments Repository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("findById calls prisma.transaction.findUnique", async () => {
    const spy = vi
      .spyOn(prisma.transaction, "findUnique")
      .mockResolvedValueOnce({ id: "tx-1" } as any);

    const res = await paymentsRepository.findById("tx-1");
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "tx-1" } }));
    expect(res).toEqual({ id: "tx-1" });
  });

  it("findByExternalId calls prisma.transaction.findUnique", async () => {
    const spy = vi
      .spyOn(prisma.transaction, "findUnique")
      .mockResolvedValueOnce({ id: "tx-1", externalId: "ext-1" } as any);

    const res = await paymentsRepository.findByExternalId("ext-1");
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ where: { externalId: "ext-1" } }));
    expect(res?.id).toBe("tx-1");
  });

  it("findByIdempotencyKey calls prisma.transaction.findUnique", async () => {
    const spy = vi
      .spyOn(prisma.transaction, "findUnique")
      .mockResolvedValueOnce({ id: "tx-1", idempotencyKey: "k-1" } as any);

    const res = await paymentsRepository.findByIdempotencyKey("k-1");
    expect(spy).toHaveBeenCalledWith({ where: { idempotencyKey: "k-1" } });
    expect(res?.id).toBe("tx-1");
  });

  it("findManyByUser calls prisma.$transaction with findMany and count", async () => {
    const spy = vi.spyOn(prisma, "$transaction").mockResolvedValueOnce([
      [{ id: "tx-1" }],
      1,
    ] as any);

    const res = await paymentsRepository.findManyByUser(
      "550e8400-e29b-41d4-a716-446655440000",
      0,
      10,
      {
        status: "SUCCESS",
        provider: "MVOLA",
      }
    );
    expect(spy).toHaveBeenCalled();
    expect(res[0]).toEqual([{ id: "tx-1" }]);
    expect(res[1]).toBe(1);
  });

  it("create calls prisma.transaction.create", async () => {
    const spy = vi
      .spyOn(prisma.transaction, "create")
      .mockResolvedValueOnce({ id: "tx-new" } as any);

    const res = await paymentsRepository.create({ amount: 1000 } as any);
    expect(spy).toHaveBeenCalledWith({ data: { amount: 1000 } });
    expect(res.id).toBe("tx-new");
  });

  it("updateStatus calls prisma.transaction.update", async () => {
    const spy = vi
      .spyOn(prisma.transaction, "update")
      .mockResolvedValueOnce({ id: "tx-1", status: "SUCCESS" } as any);

    const res = await paymentsRepository.updateStatus("tx-1", { status: "SUCCESS" });
    expect(spy).toHaveBeenCalledWith({ where: { id: "tx-1" }, data: { status: "SUCCESS" } });
    expect(res.status).toBe("SUCCESS");
  });

  it("createWebhook, findWebhookByExternalId, markWebhookProcessed", async () => {
    const createSpy = vi
      .spyOn(prisma.paymentWebhook, "create")
      .mockResolvedValueOnce({ id: "wh-1" } as any);

    const findSpy = vi
      .spyOn(prisma.paymentWebhook, "findFirst")
      .mockResolvedValueOnce({ id: "wh-1" } as any);

    const updateSpy = vi
      .spyOn(prisma.paymentWebhook, "update")
      .mockResolvedValueOnce({ id: "wh-1", processed: true } as any);

    await paymentsRepository.createWebhook({ provider: "MVOLA", externalId: "ext" } as any);
    expect(createSpy).toHaveBeenCalled();

    await paymentsRepository.findWebhookByExternalId("ext");
    expect(findSpy).toHaveBeenCalled();

    await paymentsRepository.markWebhookProcessed("wh-1", { errorMessage: "none" });
    expect(updateSpy).toHaveBeenCalled();
  });
});
