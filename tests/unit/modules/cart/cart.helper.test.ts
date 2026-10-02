import { describe, expect, it } from "vitest";
import { ForbiddenError } from "../../../../src/errors/AppError";
import { assertProductPurchasable } from "../../../../src/modules/cart/lib/helper/cart.helper";

const availableProduct = {
  ownerId: "seller-1",
  isActive: true,
  pricingMode: "FIXED",
  stock: 2,
  price: 25_000,
};

describe("assertProductPurchasable", () => {
  it("rejects a seller buying their own product", () => {
    expect(() => assertProductPurchasable(availableProduct, "seller-1"))
      .toThrow(ForbiddenError);
  });

  it("allows a different customer to buy the product", () => {
    expect(() => assertProductPurchasable(availableProduct, "customer-1"))
      .not.toThrow();
  });
});