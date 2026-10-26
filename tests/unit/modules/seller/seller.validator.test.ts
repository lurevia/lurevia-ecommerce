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

  it("accepts up to 3 store categories and boutique SEO", () => {
    const withThreeCategories = {
      ...validApplication,
      storeCategoryIds: [
        "00000000-0000-4000-8000-000000000001",
        "00000000-0000-4000-8000-000000000002",
        "00000000-0000-4000-8000-000000000003",
      ],
      metaTitle: "Atelier Demo - Artisanat Malgache",
      metaDescription: "Boutique artisanale en ligne",
      metaKeywords: ["artisanat", "madagascar"],
    };
    expect(applySellerSchema.safeParse(withThreeCategories).success).toBe(true);
  });

  it("rejects more than 3 store categories", () => {
    const withFourCategories = {
      ...validApplication,
      storeCategoryIds: [
        "00000000-0000-4000-8000-000000000001",
        "00000000-0000-4000-8000-000000000002",
        "00000000-0000-4000-8000-000000000003",
        "00000000-0000-4000-8000-000000000004",
      ],
    };
    expect(applySellerSchema.safeParse(withFourCategories).success).toBe(false);
  });
});