import { describe, expect, it } from "vitest";
import { listProductsQuerySchema } from "../src/modules/products/products.validators";
import { updateOrderStatusSchema } from "../src/modules/orders/orders.validators";
import { updateSettingsSchema } from "../src/modules/settings/settings.validators";

describe("admin API contracts", () => {
  it("accepts filters sent by the product admin list", () => {
    expect(listProductsQuerySchema.parse({
      categoryId: "00000000-0000-4000-8000-000000000001",
      priceRange: "0-50000",
      stock: "low",
      status: "new",
      limit: "96",
    })).toMatchObject({
      categoryId: "00000000-0000-4000-8000-000000000001",
      priceRange: "0-50000",
      stock: "low",
      status: "new",
      limit: 96,
    });
  });

  it("accepts admin order status values", () => {
    expect(updateOrderStatusSchema.parse({ status: "COD_PENDING" })).toEqual({ status: "COD_PENDING" });
  });

  it("accepts null for optional settings returned by Prisma", () => {
    expect(updateSettingsSchema.parse({
      contactEmail: "",
      logoUrl: null,
      legalRegistrationNumber: null,
      mvolaMerchantNumber: null,
      metaTitle: null,
      metaDescription: null,
    })).toEqual({
      contactEmail: "",
      logoUrl: null,
      legalRegistrationNumber: null,
      mvolaMerchantNumber: null,
      metaTitle: null,
      metaDescription: null,
    });
  });
});