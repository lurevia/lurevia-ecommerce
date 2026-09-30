import { favoritesRepository } from "./favorites.repository";
import { productsRepository } from "../products/products.repository";
import { toProductDto } from "../products/products.mapper";
import { NotFoundError } from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";

export const favoritesService = {
  /**
   * Liste paginée des favoris.
   * Chaque item inclut `favoritedAt` pour permettre le tri côté client.
   */
  async list(userId: string, page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);
    const [favorites, totalItems] = await favoritesRepository.findByUser(
      userId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );

    const items = favorites.map((f) => ({
      ...toProductDto(f.product),
      favoritedAt: f.createdAt,
    }));

    return buildPaginatedResult(items, totalItems, pagination);
  },

  /**
   * Bascule le statut favori : ajoute si absent, retire si déjà présent.
   * Idempotent côté client (peut être appelé plusieurs fois sans bug).
   */
  async toggle(userId: string, productId: string) {
    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Produit");

    const existing = await favoritesRepository.findOne(userId, productId);

    if (existing) {
      await favoritesRepository.delete(userId, productId);
      return { isFavorite: false, productId };
    }

    await favoritesRepository.create(userId, productId);
    return { isFavorite: true, productId };
  },

  /**
   * ✅ Pour une page catalogue : renvoie l'ensemble des IDs de produits
   * présents dans les favoris de l'utilisateur, en une seule requête.
   */
  async getFavoritedProductIds(userId: string, productIds: string[]) {
    const set = await favoritesRepository.findProductIdsInFavorites(
      userId,
      productIds
    );
    return Array.from(set);
  },
};