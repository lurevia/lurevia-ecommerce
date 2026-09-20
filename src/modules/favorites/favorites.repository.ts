import { prisma } from "../../lib/prisma";
import { productDetailInclude } from "../products/products.repository";

export const favoritesRepository = {
  findByUser: (userId: string) =>
    prisma.favoriteItem.findMany({
      where: { userId },
      include: { product: { include: productDetailInclude } },
      orderBy: { createdAt: "desc" },
    }),

  findOne: (userId: string, productId: string) =>
    prisma.favoriteItem.findUnique({ where: { userId_productId: { userId, productId } } }),

  create: (userId: string, productId: string) =>
    prisma.favoriteItem.create({ data: { userId, productId } }),

  delete: (userId: string, productId: string) =>
    prisma.favoriteItem.delete({ where: { userId_productId: { userId, productId } } }),
};
