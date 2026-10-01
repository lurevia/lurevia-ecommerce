import { productsRepository, type ProductsRepository } from "../repository/products.repository";
import { buildPaginatedResult } from "../../../utils/pagination";
import { generateUniqueProductSlug } from "../../../utils/slug";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "../dto";
import { productsMapper } from "../mapper/products.mapper";

export class ProductsService {
    constructor(
        private readonly repository: ProductsRepository
    ) { }

    async list(query: ListProductsQuery) {
        const { items, totalItems } = await this.repository.findMany(query);
        return buildPaginatedResult(productsMapper.toOutputList(items), totalItems, query);
    }

    async getById(id: string) {
        const product = await this.repository.findById(id);
        if (!product) throw new NotFoundError("Produit");
        return productsMapper.toOutput(product);
    }

    async getBySlug(slug: string) {
        const product = await this.repository.findBySlug(slug);
        if (!product) throw new NotFoundError("Produit");
        return productsMapper.toOutput(product);
    }

    async getRelated(id: string, limit = 4) {
        const product = await this.repository.findById(id);
        if (!product) throw new NotFoundError("Produit");

        const categoryIds = product.categories.map((pc) => pc.categoryId);
        if (categoryIds.length === 0) return [];

        const related = await this.repository.findRelated(id, categoryIds, limit);
        return productsMapper.toOutputList(related);
    }

    async searchSuggestions(q: string, limit: number) {
        const results = await this.repository.searchSuggestions(q, limit);
        return results.map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            imageUrl: p.images[0]?.url ?? null,
        }));
    }

    async create(input: CreateProductInput, ownerId: string) {
        const existingSku = await this.repository.findBySku(input.sku);
        if (existingSku) throw new ConflictError("Ce SKU est déjà utilisé.");

        const slug = await generateUniqueProductSlug(input.title);

        const product = await this.repository.create({
            owner: { connect: { id: ownerId } },
            title: input.title,
            slug,
            sku: input.sku,
            description: input.description,
            longDescription: input.longDescription,
            pricingMode: input.pricingMode,

            // Prix
            price: input.price,
            originalPrice: input.originalPrice,
            minPrice: input.minPrice,
            maxPrice: input.maxPrice,

            // Enchère
            auctionStartPrice: input.auctionStartPrice,
            auctionReservePrice: input.auctionReservePrice,
            auctionStartAt: input.auctionStartAt,
            auctionEndAt: input.auctionEndAt,
            auctionStatus: input.pricingMode === "AUCTION" ? "ACTIVE" : null,

            // Stock
            stock: input.stock,
            lowStockThreshold: input.lowStockThreshold,
            isNew: input.isNew,
            isActive: input.isActive,
            tags: input.tags,

            images: {
                create: input.images.map((url, position) => ({ url, position })),
            },
            colors: { create: input.colors },
            sizes: { create: input.sizes.map((value) => ({ value })) },
            categories: {
                create: input.categoryIds.map((categoryId) => ({ categoryId })),
            },
        });

        return productsMapper.toOutput(product);
    }

    async update(
        id: string,
        input: UpdateProductInput,
        userId: string,
        userRole = "SELLER"
    ) {
        const existing = await this.assertOwnership(id, userId, userRole);

        if (input.sku && input.sku !== existing.sku) {
            const skuTaken = await this.repository.findBySku(input.sku);
            if (skuTaken) throw new ConflictError("Ce SKU est déjà utilisé.");
        }

        let slug: string | undefined;
        if (input.title && input.title !== existing.title) {
            slug = await generateUniqueProductSlug(input.title, id);
        }

        await this.repository.update(id, {
            title: input.title,
            slug,
            sku: input.sku,
            description: input.description,
            longDescription: input.longDescription,
            pricingMode: input.pricingMode,

            price: input.price,
            originalPrice: input.originalPrice,
            minPrice: input.minPrice,
            maxPrice: input.maxPrice,

            auctionStartPrice: input.auctionStartPrice,
            auctionReservePrice: input.auctionReservePrice,
            auctionStartAt: input.auctionStartAt,
            auctionEndAt: input.auctionEndAt,

            stock: input.stock,
            lowStockThreshold: input.lowStockThreshold,
            isNew: input.isNew,
            isActive: input.isActive,
            tags: input.tags,
        });

        await this.repository.replaceRelations(id, {
            images: input.images,
            colors: input.colors,
            sizes: input.sizes,
            categoryIds: input.categoryIds,
        });

        const updated = await this.repository.findById(id);
        return productsMapper.toOutput(updated!);
    }

    async remove(id: string, userId: string, userRole = "SELLER") {
        await this.assertOwnership(id, userId, userRole);
        await this.repository.delete(id);
    }

    async listMine(ownerId: string, page?: number, limit?: number) {
        const p = {
            page: page ?? 1,
            limit: limit ?? 20,
        };
        const [items, totalItems] = await this.repository.findManyByOwner(
            ownerId,
            (p.page - 1) * p.limit,
            p.limit
        );
        return buildPaginatedResult(
            productsMapper.toOutputList(items),
            totalItems,
            { page: p.page, limit: p.limit }
        );
    }

    private async assertOwnership(productId: string, userId: string, userRole: string) {
        const product = await this.repository.findById(productId);
        if (!product) throw new NotFoundError("Produit");
        if (userRole !== "ADMIN" && product.ownerId !== userId) {
            throw new ForbiddenError("Ce produit ne vous appartient pas.");
        }
        return product;
    }
}

export const productsService = new ProductsService(productsRepository);
