import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";
import { productsMapper } from "../mapper/products.mapper";
import { productDetailInclude } from "../lib/constant/products.constant";

export class ProductRecommendationService {
  /**
   * Calcule les catégories préférées d'un utilisateur d'après son historique d'achats
   * (ex: achats fréquents d'eaux/boissons, artisanat, etc.)
   */
  async getUserPreferredCategoryIds(userId: string): Promise<string[]> {
    try {
      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            userId,
            status: { in: ["PAID", "DELIVERED", "SHIPPED", "PENDING"] },
          },
        },
        select: {
          quantity: true,
          product: {
            select: {
              categories: {
                select: { categoryId: true },
              },
            },
          },
        },
        take: 200,
      });

      const frequency: Record<string, number> = {};
      for (const item of orderItems) {
        const qty = item.quantity || 1;
        for (const pc of item.product.categories) {
          frequency[pc.categoryId] = (frequency[pc.categoryId] || 0) + qty;
        }
      }

      return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .map(([categoryId]) => categoryId);
    } catch (err) {
      logger.error({ err, userId }, "Erreur lors du calcul des catégories préférées");
      return [];
    }
  }

  /**
   * Retourne les statistiques d'affinité d'un utilisateur par catégorie
   */
  async getUserCategoryStats(userId: string) {
    const preferredIds = await this.getUserPreferredCategoryIds(userId);
    if (preferredIds.length === 0) return [];

    const categories = await prisma.category.findMany({
      where: { id: { in: preferredIds.slice(0, 5) } },
      select: { id: true, name: true, slug: true, iconName: true },
    });

    return categories.map((cat) => ({
      ...cat,
      isTopAffinity: true,
    }));
  }

  /**
   * Récupère une sélection de produits personnalisés pour l'utilisateur
   */
  async getPersonalizedRecommendations(userId: string, limit = 8) {
    const preferredCategoryIds = await this.getUserPreferredCategoryIds(userId);

    if (preferredCategoryIds.length === 0) {
      // Si aucun historique d'achat, renvoyer les produits les plus populaires
      const fallback = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { reviewCountCache: "desc" },
        take: limit,
        include: productDetailInclude,
      });
      return productsMapper.toOutputList(fallback);
    }

    // Sélectionner les produits appartenant aux catégories préférées
    const recommended = await prisma.product.findMany({
      where: {
        isActive: true,
        categories: {
          some: {
            categoryId: { in: preferredCategoryIds.slice(0, 3) },
          },
        },
      },
      orderBy: [{ ratingCache: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: productDetailInclude,
    });

    const output = productsMapper.toOutputList(recommended);
    return output.map((p) => ({
      ...p,
      isRecommendedForYou: true,
    }));
  }

  /**
   * Notifie les utilisateurs qui achètent souvent des produits dans ces catégories
   * lorsqu'un nouveau produit pertinent ou réassort est publié
   */
  async notifyInterestedUsers(
    productId: string,
    categoryIds: string[],
    productTitle: string,
    productSlug: string
  ): Promise<number> {
    if (!categoryIds || categoryIds.length === 0) return 0;

    try {
      // Trouver les catégories concernées
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });
      const categoryNames = categories.map((c) => c.name).join(", ");

      // Trouver les utilisateurs ayant déjà commandé dans ces catégories
      const pastBuyers = await prisma.orderItem.findMany({
        where: {
          product: {
            categories: {
              some: { categoryId: { in: categoryIds } },
            },
          },
          order: {
            status: { in: ["PAID", "DELIVERED", "SHIPPED"] },
          },
        },
        select: {
          order: {
            select: { userId: true },
          },
        },
        distinct: ["orderId"],
        take: 100,
      });

      const uniqueUserIds = Array.from(
        new Set(pastBuyers.map((pb) => pb.order.userId).filter(Boolean))
      );

      if (uniqueUserIds.length === 0) return 0;

      let notifiedCount = 0;
      for (const targetUserId of uniqueUserIds) {
        const referenceKey = `notif_cat_boost_${productId}_${targetUserId}`;
        try {
          await prisma.notification.upsert({
            where: {
              userId_referenceKey: {
                userId: targetUserId,
                referenceKey,
              },
            },
            create: {
              userId: targetUserId,
              type: "PROMO",
              title: `Nouveauté : ${categoryNames || "Produit recommandé"}`,
              message: `Un nouveau produit pouvant vous intéresser vient d'arriver : « ${productTitle} ».`,
              actionUrl: `/products/${productSlug}`,
              referenceKey,
            },
            update: {},
          });
          notifiedCount++;
        } catch {
          // Ignorer les doublons
        }
      }

      logger.info(
        { productId, categoryIds, notifiedCount },
        "Notifications ciblées envoyées aux utilisateurs intéressés par cette catégorie"
      );
      return notifiedCount;
    } catch (err) {
      logger.error({ err, productId }, "Erreur lors de la notification des utilisateurs intéressés");
      return 0;
    }
  }
}

export const productRecommendationService = new ProductRecommendationService();
