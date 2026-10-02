import { describe, expect, it } from "vitest";
import { applySellerSchema } from "../../../../src/modules/seller/validator/seller.validator";

const validApplication = {
  type: "PERCENTAGE",
  value: 10,
  storeName: "Atelier Demo",
  storeDescription: "Une boutique locale de créations artisanales malgaches.",
  storeCategoryId: "00000000-0000-4000-8000-000000000001",
};

describe("applySellerSchema", () => {
  it("accepts a seller application with a selected store category", () => {
    expect(applySellerSchema.safeParse(validApplication).success).toBe(true);
  });

  it("requires a selected store category", () => {
    const { storeCategoryId: _storeCategoryId, ...application } = validApplication;
    expect(applySellerSchema.safeParse(application).success).toBe(false);
  });
});