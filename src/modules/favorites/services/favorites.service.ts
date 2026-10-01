import { favoritesRepository, type FavoritesRepository } from "../repository/favorites.repository";
import { productsRepository } from "../../products/repository/products.repository";
import { NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { productsMapper } from "../../products/mapper/products.mapper";

export class FavoritesService {
    constructor(
        private readonly repository: FavoritesRepository
    ) { }

    /**
     * Liste paginée des favoris.
     * Chaque item inclut `favoritedAt` pour permettre le tri côté client.
     */
    async list(userId: string, page?: number, limit?: number) {
        const pagination = normalizePagination(page, limit);
        const [favorites, totalItems] = await this.repository.findByUser(
            userId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );

        const items = favorites.map((f) => ({
            ...productsMapper.toOutput(f.product),
            favoritedAt: f.createdAt,
        }));

        return buildPaginatedResult(items, totalItems, pagination);
    }

    /**
     * Bascule le statut favori : ajoute si absent, retire si déjà présent.
     * Idempotent côté client (peut être appelé plusieurs fois sans bug).
     */
    async toggle(userId: string, productId: string) {
        const product = await productsRepository.findById(productId);
        if (!product) throw new NotFoundError("Produit");

        const existing = await this.repository.findOne(userId, productId);

        if (existing) {
            await this.repository.delete(userId, productId);
            return { isFavorite: false, productId };
        }

        await this.repository.create(userId, productId);
        return { isFavorite: true, productId };
    }

    /**
     * ✅ Pour une page catalogue : renvoie l'ensemble des IDs de produits
     * présents dans les favoris de l'utilisateur, en une seule requête.
     */
    async getFavoritedProductIds(userId: string, productIds: string[]) {
        const set = await this.repository.findProductIdsInFavorites(
            userId,
            productIds
        );
        return Array.from(set);
    }
}

export const favoritesService = new FavoritesService(favoritesRepository);
