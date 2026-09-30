import { cartRepository } from "./cart.repository";
import { productsRepository } from "../products/products.repository";
import { BadRequestError, NotFoundError } from "../../errors/AppError";
import type { CartItemQuery } from "./cart.validators";
import { assertProductPurchasable, toCartResponse } from "./cart.helpers";

export const cartService = {
  async get(userId: string) {
    const items = await cartRepository.findByUser(userId);
    return toCartResponse(items);
  },

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    variants: CartItemQuery
  ) {
    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Produit");

    assertProductPurchasable(product);

    if (product.stock <= 0) {
      throw new BadRequestError("Ce produit est en rupture de stock.");
    }

    if (variants.colorId) {
      const color = await productsRepository.findColorById(variants.colorId);
      if (!color || color.productId !== productId) {
        throw new BadRequestError("Couleur invalide pour ce produit.");
      }
    }

    if (variants.sizeId) {
      const size = await productsRepository.findSizeById(variants.sizeId);
      if (!size || size.productId !== productId) {
        throw new BadRequestError("Taille invalide pour ce produit.");
      }
    }

    const existing = await cartRepository.findOne({
      userId,
      productId,
      colorId: variants.colorId ?? null,
      sizeId: variants.sizeId ?? null,
    });

    const nextQuantity = Math.min(
      (existing?.quantity ?? 0) + quantity,
      product.stock
    );

    await cartRepository.upsert(
      {
        userId,
        productId,
        colorId: variants.colorId ?? null,
        sizeId: variants.sizeId ?? null,
      },
      nextQuantity,
      { productId }
    );

    return cartService.get(userId);
  },

  async updateItem(
    userId: string,
    productId: string,
    quantity: number,
    variants: CartItemQuery
  ) {
    const key = {
      userId,
      productId,
      colorId: variants.colorId ?? null,
      sizeId: variants.sizeId ?? null,
    };

    if (quantity <= 0) {
      await cartRepository.delete(key);
      return cartService.get(userId);
    }

    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Produit");

    assertProductPurchasable(product);

    if (product.stock <= 0) {
      throw new BadRequestError("Ce produit est en rupture de stock.");
    }

    const cappedQuantity = Math.min(quantity, product.stock);
    await cartRepository.upsert(key, cappedQuantity, { productId });

    return cartService.get(userId);
  },

  async removeItem(
    userId: string,
    productId: string,
    variants: CartItemQuery
  ) {
    await cartRepository.delete({
      userId,
      productId,
      colorId: variants.colorId ?? null,
      sizeId: variants.sizeId ?? null,
    });
    return cartService.get(userId);
  },

  async clear(userId: string) {
    await cartRepository.clear(userId);
    return cartService.get(userId);
  },
};
