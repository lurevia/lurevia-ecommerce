import { prisma } from "../../lib/prisma";
import { productDetailInclude } from "../products/products.repository";

export const cartRepository = {
  findByUser: (userId: string) =>
    prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: productDetailInclude } },
      orderBy: { createdAt: "asc" },
    }),

  findOne: (userId: string, productId: string) =>
    prisma.cartItem.findFirst({
      where: { userId, productId }
    }),

  upsertQuantity: (userId: string, productId: string, quantity: number) =>
    prisma.cartItem.upsert({
      where: {
        userId_productId_colorId_sizeId: {
          userId,
          productId,
          colorId: null,
          sizeId: null
        }
      },
      update: { quantity },
      create: { userId, productId, quantity },
    }),

  delete: (userId: string, productId: string) =>
    prisma.cartItem.deleteMany({
      where: { userId, productId }
    }),

  clear: (userId: string) => prisma.cartItem.deleteMany({ where: { userId } }),
};
