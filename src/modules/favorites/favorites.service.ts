import { favoritesRepository } from "./favorites.repository";
import { productsRepository } from "../products/products.repository";
import { toProductDto } from "../products/products.mapper";
import { NotFoundError } from "../../errors/AppError";

export const favoritesService = {
  async list(userId: string) {
    const favorites = await favoritesRepository.findByUser(userId);
    return favorites.map((f) => toProductDto(f.product));
  },

  /** Bascule le statut favori : ajoute si absent, retire si déjà présent (idempotent côté client). */
  async toggle(userId: string, productId: string) {
    const product = await productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Produit");

    const existing = await favoritesRepository.findOne(userId, productId);
    if (existing) {
      await favoritesRepository.delete(userId, productId);
      return { isFavorite: false };
    }

    await favoritesRepository.create(userId, productId);
    return { isFavorite: true };
  },
};
