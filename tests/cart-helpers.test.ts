import { describe, it, expect } from "vitest";
import {
  assertProductPurchasable,
  toCartResponse,
} from "../src/modules/cart/cart.helpers";
import { ConflictError } from "../src/errors/AppError";

describe("Cart Helpers", () => {
  describe("assertProductPurchasable", () => {
    it("should allow active fixed-price product with valid price and stock", () => {
      expect(() =>
        assertProductPurchasable({
          isActive: true,
          pricingMode: "FIXED",
          stock: 5,
          price: 20000,
        })
      ).not.toThrow();
    });

    it("should reject inactive product", () => {
      expect(() =>
        assertProductPurchasable({
          isActive: false,
          pricingMode: "FIXED",
          stock: 5,
          price: 20000,
        })
      ).toThrow(ConflictError);
    });

    it("should reject AUCTION pricing mode", () => {
      expect(() =>
        assertProductPurchasable({
          isActive: true,
          pricingMode: "AUCTION",
          stock: 1,
          price: 10000,
        })
      ).toThrow(ConflictError);
    });

    it("should reject NEGOTIABLE pricing mode", () => {
      expect(() =>
        assertProductPurchasable({
          isActive: true,
          pricingMode: "NEGOTIABLE",
          stock: 1,
          price: 10000,
        })
      ).toThrow(ConflictError);
    });

    it("should reject ON_REQUEST pricing mode", () => {
      expect(() =>
        assertProductPurchasable({
          isActive: true,
          pricingMode: "ON_REQUEST",
          stock: 1,
          price: 10000,
        })
      ).toThrow(ConflictError);
    });

    it("should reject product with null price", () => {
      expect(() =>
        assertProductPurchasable({
          isActive: true,
          pricingMode: "FIXED",
          stock: 5,
          price: null,
        })
      ).toThrow(ConflictError);
    });
  });

  describe("toCartResponse", () => {
    it("should calculate correct totals and subtotal for items", () => {
      const mockItems = [
        {
          id: "cart-1",
          quantity: 2,
          color: { id: "c1", name: "Rouge", hex: "#ff0000" },
          size: { id: "s1", name: "M" },
          product: {
            id: "p1",
            title: "Produit 1",
            slug: "produit-1",
            price: 15000,
            originalPrice: null,
            images: [],
            stock: 10,
            isActive: true,
            isFeatured: false,
            pricingMode: "FIXED" as const,
            ratingCache: 4.5,
            reviewCountCache: 10,
            seller: { id: "s1", shopName: "Boutique", isVerified: true },
            category: { id: "cat1", name: "Mode", slug: "mode" },
            categories: [],
            colors: [],
            sizes: [],
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: "cart-2",
          quantity: 3,
          color: null,
          size: null,
          product: {
            id: "p2",
            title: "Produit 2",
            slug: "produit-2",
            price: 10000,
            originalPrice: null,
            images: [],
            stock: 5,
            isActive: true,
            isFeatured: false,
            pricingMode: "FIXED" as const,
            ratingCache: 5,
            reviewCountCache: 2,
            seller: { id: "s1", shopName: "Boutique", isVerified: true },
            category: { id: "cat1", name: "Mode", slug: "mode" },
            categories: [],
            colors: [],
            sizes: [],
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      const res = toCartResponse(mockItems as any);
      expect(res.totalItems).toBe(5);
      expect(res.totalPrice).toBe(2 * 15000 + 3 * 10000);
      expect(res.items.length).toBe(2);
      expect(res.items[0].subtotal).toBe(30000);
      expect(res.items[1].subtotal).toBe(30000);
    });
  });
});
