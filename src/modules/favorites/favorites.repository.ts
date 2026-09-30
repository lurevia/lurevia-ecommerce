import { prisma } from "../../lib/prisma";
import { productDetailInclude } from "../products/products.repository";

export const favoritesRepository = {
  /**
   * Liste paginée des favoris d'un utilisateur.
   * Le tri par défaut est "dernier ajouté en premier".
   */
  findByUser: (userId: string, skip = 0, take = 50) =>
    prisma.$transaction([
      prisma.favoriteItem.findMany({
        where: { userId },
        include: { product: { include: productDetailInclude } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.favoriteItem.count({ where: { userId } }),
    ]),

  findOne: (userId: string, productId: string) =>
    prisma.favoriteItem.findUnique({
      where: { userId_productId: { userId, productId } },
    }),

  create: (userId: string, productId: string) =>
    prisma.favoriteItem.create({ data: { userId, productId } }),

  delete: (userId: string, productId: string) =>
    prisma.favoriteItem.delete({
      where: { userId_productId: { userId, productId } },
    }),

  /**
   * ✅ Vérifie en une requête si une liste de produits est dans les favoris.
   * Utile pour afficher l'icône "cœur" sur une page catalogue.
   */
  findProductIdsInFavorites: async (
    userId: string,
    productIds: string[]
  ): Promise<Set<string>> => {
    if (productIds.length === 0) return new Set();
    const rows = await prisma.favoriteItem.findMany({
      where: { userId, productId: { in: productIds } },
      select: { productId: true },
    });
    return new Set(rows.map((r) => r.productId));
  },
};