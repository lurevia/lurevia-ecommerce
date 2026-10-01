import type { SellerContract } from "@prisma/client";

export class SellerContractsMapper {
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO
  // ─────────────────────────────────────────────────────────────────────────────
  toOutput(c: SellerContract) {
    return {
      id: c.id,
      version: c.version,
      type: c.type,
      value: c.value,
      currency: c.currency,
      status: c.status,
      effectiveFrom: c.effectiveFrom,
      effectiveTo: c.effectiveTo,
      rejectionReason: c.rejectionReason,
      reviewedAt: c.reviewedAt,
      createdAt: c.createdAt,
    };
  }

  toOutputList(items: SellerContract[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const sellerContractsMapper = new SellerContractsMapper();
