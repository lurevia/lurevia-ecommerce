import { cartRepository } from "./cart.repository";
import { productsRepository } from "../products/products.repository";
import { toProductDto } from "../products/products.mapper";
import { BadRequestError, NotFoundError } from "../../errors/AppError";

const toCartResponse = (items: Awaited<ReturnType<typeof cartRepository.findByUser>>) => {
  const dtoItems = items.map((item) => ({
    product: toProductDto(item.product),
    quantity: item.quantity,
  }));
  const totalItems = dtoItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = dtoItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0);
  return { items: dtoItems, totalItems, totalPrice };
};

export const cartService = {
  async get(userId: string) {
    const items = await cartRepository.findByUser(userId);
    return toCartResponse(items);
  },

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Produit");
    if (product.stock <= 0) throw new BadRequestError("Ce produit est en rupture de stock.");

    const existing = await cartRepository.findOne(userId, productId);
    const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, product.stock);

    await cartRepository.upsertQuantity(userId, productId, nextQuantity);
    return cartService.get(userId);
  },

  async updateItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      await cartRepository.delete(userId, productId).catch(() => undefined);
      return cartService.get(userId);
    }

    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Produit");
    if (product.stock <= 0) throw new BadRequestError("Ce produit est en rupture de stock.");

    const cappedQuantity = Math.min(quantity, product.stock);
    await cartRepository.upsertQuantity(userId, productId, cappedQuantity);
    return cartService.get(userId);
  },

  async removeItem(userId: string, productId: string) {
    await cartRepository.delete(userId, productId).catch(() => undefined);
    return cartService.get(userId);
  },

  async clear(userId: string) {
    await cartRepository.clear(userId);
    return cartService.get(userId);
  },
};
