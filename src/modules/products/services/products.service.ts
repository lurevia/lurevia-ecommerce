import { productsRepository, type ProductsRepository } from "../repository/products.repository";
import { buildPaginatedResult } from "../../../utils/pagination";
import { generateUniqueProductSlug } from "../../../utils/slug";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "../dto";
import { productsMapper } from "../mapper/products.mapper";
import { prisma } from "../../../lib/prisma";
import slugify from "slugify";

import { productRecommendationService } from "./product-recommendation.service";

export class ProductsService {
    constructor(
        private readonly repository: ProductsRepository
    ) { }

    async list(query: ListProductsQuery, userId?: string) {
        const { items, totalItems } = await this.repository.findMany(query);
        let outputItems = productsMapper.toOutputList(items);

        // Système de valorisation des catégories d'après les achats de chaque utilisateur
        if (userId) {
            const preferredCategoryIds = await productRecommendationService.getUserPreferredCategoryIds(userId);
            if (preferredCategoryIds.length > 0) {
                outputItems = outputItems.map((prod) => {
                    const hasPreferredCategory = (prod as any).categories?.some((cat: any) =>
                        preferredCategoryIds.includes(cat.id ?? cat.categoryId)
                    );
                    return {
                        ...prod,
                        isPreferredCategory: Boolean(hasPreferredCategory),
                    };
                });

                // Si pas de tri personnalisé spécifique, booster en tête les produits de la catégorie valorisée
                if (!query.sortBy || query.sortBy === "newest" || query.sortBy === "popular") {
                    outputItems.sort((a: any, b: any) => {
                        const aScore = a.isPreferredCategory ? 1 : 0;
                        const bScore = b.isPreferredCategory ? 1 : 0;
                        return bScore - aScore;
                    });
                }
            }
        }

        return buildPaginatedResult(outputItems, totalItems, query);
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

    async searchSuggestions(q: string, limit: number, userId?: string) {
        const results = await this.repository.searchSuggestions(q, limit * 2);
        let suggestions = results.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            price: p.price,
            imageUrl: p.images[0]?.url ?? null,
            categoryIds: p.categories?.map((c) => c.categoryId) ?? [],
        }));

        if (userId) {
            const preferredCategoryIds = await productRecommendationService.getUserPreferredCategoryIds(userId);
            if (preferredCategoryIds.length > 0) {
                suggestions = suggestions.sort((a, b) => {
                    const aPref = a.categoryIds.some((cid) => preferredCategoryIds.includes(cid)) ? 1 : 0;
                    const bPref = b.categoryIds.some((cid) => preferredCategoryIds.includes(cid)) ? 1 : 0;
                    return bPref - aPref;
                });
            }
        }

        return suggestions.slice(0, limit).map(({ id, slug, title, price, imageUrl }) => ({
            id,
            slug,
            title,
            price,
            imageUrl,
        }));
    }

    async getPersonalizedRecommendations(userId: string, limit = 8) {
        return productRecommendationService.getPersonalizedRecommendations(userId, limit);
    }

    async getUserCategoryStats(userId: string) {
        return productRecommendationService.getUserCategoryStats(userId);
    }

    async create(input: CreateProductInput, ownerId: string, userRole = "SELLER") {
        const existingSku = await this.repository.findBySku(input.sku);
        if (existingSku) throw new ConflictError("Ce SKU est déjà utilisé.");

        const slug = await generateUniqueProductSlug(input.title);

        let boutique = await prisma.boutique.findUnique({
            where: { ownerId },
            select: { id: true, storeCategoryId: true },
        });
        if (!boutique) {
            const seller = await prisma.user.findUnique({
                where: { id: ownerId },
                select: { fullName: true },
            });
            const boutiqueName = seller?.fullName ? `Boutique de ${seller.fullName}` : `Boutique ${ownerId.slice(0, 8)}`;
            const primaryCatId = input.categoryIds[0];
            boutique = await prisma.boutique.create({
                data: {
                    ownerId,
                    name: boutiqueName,
                    slug: await generateUniqueProductSlug(boutiqueName),
                    storeCategoryId: primaryCatId,
                    categories: {
                        create: input.categoryIds.slice(0, 3).map((categoryId) => ({ categoryId })),
                    },
                },
                select: { id: true, storeCategoryId: true },
            });
        }

        const categoryIds = await this.enforceSellerCategory(input.categoryIds, ownerId, userRole);

        const tagConnectors = input.tags?.length
            ? await Promise.all(
                input.tags.map(async (name) => {
                    const tagSlug = slugify(name, { lower: true, strict: true }) || name.toLowerCase();
                    const tag = await prisma.tag.upsert({
                        where: { slug: tagSlug },
                        update: {},
                        create: { name, slug: tagSlug },
                    });
                    return { tag: { connect: { id: tag.id } } };
                })
            )
            : [];

        const product = await this.repository.create({
            boutique: { connect: { id: boutique.id } },
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
            tags: tagConnectors.length ? { create: tagConnectors } : undefined,

            images: {
                create: input.images.map((url, position) => ({ url, position })),
            },
            colors: { create: input.colors },
            sizes: { create: input.sizes.map((value) => ({ value })) },
            categories: {
                create: categoryIds.map((categoryId) => ({ categoryId })),
            },
        });

        // Notifier les acheteurs réguliers de cette catégorie
        productRecommendationService
            .notifyInterestedUsers(product.id, categoryIds, product.title, product.slug)
            .catch(() => {});

        return productsMapper.toOutput(product);
    }

    async update(
        id: string,
        input: UpdateProductInput,
        userId: string,
        userRole = "SELLER"
    ) {
        const existing = await this.assertOwnership(id, userId, userRole);
        const categoryIds = input.categoryIds
            ? await this.enforceSellerCategory(input.categoryIds, userId, userRole)
            : undefined;

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
        });

        if (input.tags) {
            await prisma.productTag.deleteMany({ where: { productId: id } });
            for (const name of input.tags) {
                const tagSlug = slugify(name, { lower: true, strict: true }) || name.toLowerCase();
                const tag = await prisma.tag.upsert({
                    where: { slug: tagSlug },
                    update: {},
                    create: { name, slug: tagSlug },
                });
                await prisma.productTag.create({
                    data: { productId: id, tagId: tag.id },
                });
            }
        }

        await this.repository.replaceRelations(id, {
            images: input.images,
            colors: input.colors,
            sizes: input.sizes,
            categoryIds,
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

    private async assertOwnership(productId: string, userId: string, _userRole?: string) {
        const product = await this.repository.findById(productId);
        if (!product) throw new NotFoundError("Produit");

        // RÈGLE MÉTIER : Un administrateur ou vendeur ne peut modifier ou supprimer QUE les produits
        // de sa propre boutique (ou boutique managée). Il ne peut pas supprimer ceux des autres boutiques.
        const isOwner = product.boutique?.ownerId === userId;
        if (!isOwner) {
            const isManager = await prisma.managedBoutique.findUnique({
                where: { userId_boutiqueId: { userId, boutiqueId: product.boutiqueId } },
            });
            if (!isManager) {
                throw new ForbiddenError("Vous ne pouvez modifier ou supprimer que les produits de votre propre boutique.");
            }
        }
        return product;
    }

    private async enforceSellerCategory(
        categoryIds: string[],
        ownerId: string,
        _userRole?: string
    ) {
        const allowedCategoryIds = await this.repository.sellerStoreCategoryIds(ownerId);
        if (allowedCategoryIds.length === 0) {
            throw new ConflictError("Choisissez d'abord les catégories de votre boutique (1 à 3 catégories).");
        }
        // Vérifier que tous les categoryIds du produit font partie des catégories autorisées de la boutique
        const unauthorized = categoryIds.filter((cid) => !allowedCategoryIds.includes(cid));
        if (unauthorized.length > 0) {
            throw new ForbiddenError("Une boutique ne peut vendre que des produits appartenant à ses 3 catégories autorisées.");
        }
        return categoryIds;
    }
}

export const productsService = new ProductsService(productsRepository);
