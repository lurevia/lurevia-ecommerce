import type { OrderStatus } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { productsService } from "../products/products.service";
import { sellerRepository } from "./seller.repository";
import type { CreateProductInput, UpdateProductInput } from "../products/products.validators";
export const sellerService = {
  async listProducts(userId: string, page: number, limit: number) {
    const [items, totalItems] = await sellerRepository.products(userId, (page - 1) * limit, limit);
    return { items, totalItems, page, limit, totalPages: Math.ceil(totalItems / limit) };
  },
  createProduct: (userId: string, input: CreateProductInput) => productsService.create(input, userId),
  updateProduct: (userId: string, id: string, input: UpdateProductInput) => productsService.update(id, input, userId),
  removeProduct: (userId: string, id: string) => productsService.remove(id, userId),
  async listOrders(userId: string, page: number, limit: number) {
    const [items, totalItems] = await sellerRepository.orders(userId, (page - 1) * limit, limit);
    return { items, totalItems, page, limit, totalPages: Math.ceil(totalItems / limit) };
  },
  async getOrder(userId: string, id: string) {
    const item = await sellerRepository.order(userId, id);
    if (!item) throw new NotFoundError("Commande");
    return item;
  },
  async updateOrderStatus(userId: string, id: string, status: OrderStatus) {
    const order = await sellerService.getOrder(userId, id);
    const hasOtherSellerItems = order.items.some((item) => item.product.ownerId !== userId);
    if (hasOtherSellerItems) {
      throw new ForbiddenError("Cette commande contient des articles d'un autre vendeur et ne peut pas être modifiée globalement.");
    }
    return prisma.order.update({ where: { id: order.id }, data: { status }, include: { items: true } });
  },
  feedback: (userId: string) => sellerRepository.feedback(userId),
  stats: (userId: string) => sellerRepository.stats(userId),
};
