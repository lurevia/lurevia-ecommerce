import { describe, it, expect } from "vitest";
import { toTransactionDto } from "../src/modules/payments/payments.mapper";

describe("Payments Mapper", () => {
  it("should map transaction entity to DTO correctly", () => {
    const now = new Date();
    const entity = {
      id: "tx-1",
      orderId: "ord-1",
      amount: 15000,
      currency: "MGA",
      method: "MOBILE_MONEY" as const,
      provider: "MVOLA" as const,
      status: "SUCCESS" as const,
      idempotencyKey: "idem-1",
      externalRequestId: "ext-1",
      externalId: "ext-ref",
      failureReason: null,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
      order: {
        id: "ord-1",
        orderNumber: "CMD-12345",
        status: "PAID" as const,
        total: 15000,
        currency: "MGA",
        userId: "u1",
      },
    };

    const dto = toTransactionDto(entity as any);
    expect(dto.id).toBe("tx-1");
    expect(dto.orderId).toBe("ord-1");
    expect(dto.order.orderNumber).toBe("CMD-12345");
    expect(dto.amount).toBe(15000);
    expect(dto.currency).toBe("MGA");
    expect(dto.provider).toBe("MVOLA");
    expect(dto.status).toBe("SUCCESS");
    expect(dto.completedAt).toBe(now);
    expect(dto.failureReason).toBeNull();
  });
});
