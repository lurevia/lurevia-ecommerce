import type { OrderStatus } from "@prisma/client";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { prisma } from "../../../lib/prisma";
import { productsService } from "../../products/services/products.service";
import { sellerRepository, type SellerRepository } from "../repository/seller.repository";
import type { CreateProductInput, UpdateProductInput } from "../../products/validator/products.validator";
import { normalizePagination, buildPaginatedResult } from "../../../utils/pagination";
import { productsMapper } from "../../products/mapper/products.mapper";
import type { z } from "zod";
import type { publicSellerListSchema, updateSellerProfileSchema } from "../validator/seller.validator";

type PublicSellerListQuery = z.infer<typeof publicSellerListSchema>;
type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;

export class SellerService {
    constructor(
        private readonly repository: SellerRepository
    ) { }

    async apply(userId: string, input: {
        type?: "PERCENTAGE" | "MONTHLY_FIXED";
        value?: number;
        storeName: string;
        storeDescription: string;
        storeCategoryId?: string;
        storeCategoryIds?: string[];
        storeLogoUrl?: string;
        storeCoverUrl?: string;
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string[];
        ogImageUrl?: string;
    }) {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { id: true, role: true, isVerified: true },
            });
            if (!user) throw new NotFoundError("Utilisateur");

            const existingBoutique = await tx.boutique.findUnique({
                where: { ownerId: userId },
                select: { id: true },
            });
            if (existingBoutique) {
                throw new ConflictError("Vous possédez déjà une boutique.");
            }

            // Résolution des catégories autorisées (1 à 3 catégories max)
            const rawCategoryIds = input.storeCategoryIds && input.storeCategoryIds.length > 0
                ? input.storeCategoryIds
                : (input.storeCategoryId ? [input.storeCategoryId] : []);

            if (rawCategoryIds.length === 0) {
                throw new ConflictError("Veuillez choisir au moins une catégorie pour la boutique.");
            }
            if (rawCategoryIds.length > 3) {
                throw new ConflictError("Une boutique ne peut appartenir qu'à 3 catégories maximum.");
            }

            const uniqueCategoryIds = Array.from(new Set(rawCategoryIds));
            const existingCategories = await tx.category.findMany({
                where: { id: { in: uniqueCategoryIds } },
                select: { id: true },
            });
            if (existingCategories.length !== uniqueCategoryIds.length) {
                throw new NotFoundError("Une ou plusieurs catégories sélectionnées sont introuvables.");
            }

            // Tout utilisateur authentifié peut créer sa boutique
            let updatedUser = user;
            if (user.role !== "SELLER" && user.role !== "ADMIN") {
                updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { role: "SELLER" },
                    select: { id: true, role: true, isVerified: true },
                });
            }

            const slugCandidate = input.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            const primaryCategoryId = uniqueCategoryIds[0];

            const boutique = await tx.boutique.create({
                data: {
                    ownerId: userId,
                    name: input.storeName,
                    slug: slugCandidate || `boutique-${userId.slice(0, 8)}`,
                    description: input.storeDescription,
                    logoUrl: input.storeLogoUrl,
                    coverUrl: input.storeCoverUrl,
                    storeCategoryId: primaryCategoryId,
                    // SEO spécifique à la boutique
                    metaTitle: input.metaTitle || `${input.storeName} - Boutique en ligne`,
                    metaDescription: input.metaDescription || input.storeDescription.slice(0, 160),
                    metaKeywords: input.metaKeywords ?? [],
                    ogImageUrl: input.ogImageUrl || input.storeCoverUrl || input.storeLogoUrl,
                    categories: {
                        create: uniqueCategoryIds.map((categoryId) => ({ categoryId })),
                    },
                },
                include: {
                    categories: { include: { category: true } },
                },
            });

            const latestContract = await tx.sellerContract.findFirst({
                where: { sellerId: userId },
                orderBy: { version: "desc" },
                select: { version: true },
            });
            const contract = await tx.sellerContract.create({
                data: {
                    sellerId: userId,
                    version: (latestContract?.version ?? 0) + 1,
                    type: input.type ?? "PERCENTAGE",
                    value: input.value ?? 10,
                },
            });
            return { user: updatedUser, boutique, contract };
        });
    }

    async listPublicProfiles(query: PublicSellerListQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] = await this.repository.publicProfiles(
            query.search,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );
        const sellers = items.map((seller) => ({
            id: seller.id,
            storeName: seller.name,
            description: seller.description,
            logoUrl: seller.logoUrl,
            coverUrl: seller.coverUrl,
            storeCategoryId: seller.storeCategoryId,
            storeCategory: seller.storeCategory,
            productCount: seller._count.products,
        }));
        return buildPaginatedResult(sellers, totalItems, pagination);
    }

    async getPublicProfile(id: string) {
        const seller = await this.repository.publicProfile(id);
        if (!seller) throw new NotFoundError("Vendeur");
        const boutique = await prisma.boutique.findUnique({
            where: { id: seller.id },
            select: {
                metaTitle: true,
                metaDescription: true,
                metaKeywords: true,
                ogImageUrl: true,
                categories: {
                    select: {
                        category: { select: { id: true, name: true, slug: true } },
                    },
                },
            },
        });
        return {
            id: seller.id,
            storeName: seller.name,
            description: seller.description,
            logoUrl: seller.logoUrl,
            coverUrl: seller.coverUrl,
            storeCategoryId: seller.storeCategoryId,
            storeCategory: seller.storeCategory,
            categories: boutique?.categories?.map((c) => c.category) ?? (seller.storeCategory ? [seller.storeCategory] : []),
            seo: {
                metaTitle: boutique?.metaTitle ?? `${seller.name} - Boutique en ligne`,
                metaDescription: boutique?.metaDescription ?? seller.description,
                metaKeywords: boutique?.metaKeywords ?? [],
                ogImageUrl: boutique?.ogImageUrl ?? seller.coverUrl ?? seller.logoUrl,
            },
            products: productsMapper.toOutputList(seller.products),
        };
    }

    async updateProfile(userId: string, input: UpdateSellerProfileInput) {
        const boutique = await prisma.boutique.findUnique({
            where: { ownerId: userId },
            select: {
                id: true,
                storeCategoryId: true,
                categories: { select: { categoryId: true } },
                _count: { select: { products: true } },
            },
        });
        if (!boutique) throw new NotFoundError("Boutique non trouvée.");

        const categoryUpdates: string[] | null = input.storeCategoryIds && input.storeCategoryIds.length > 0
            ? input.storeCategoryIds
            : (input.storeCategoryId ? [input.storeCategoryId] : null);

        if (categoryUpdates) {
            if (categoryUpdates.length > 3) {
                throw new ConflictError("Une boutique ne peut appartenir qu'à 3 catégories maximum.");
            }
            const uniqueIds = Array.from(new Set(categoryUpdates));
            const existingCategories = await prisma.category.findMany({
                where: { id: { in: uniqueIds } },
                select: { id: true },
            });
            if (existingCategories.length !== uniqueIds.length) {
                throw new NotFoundError("Une ou plusieurs catégories sélectionnées sont introuvables.");
            }

            await prisma.$transaction([
                prisma.boutiqueCategory.deleteMany({ where: { boutiqueId: boutique.id } }),
                prisma.boutiqueCategory.createMany({
                    data: uniqueIds.map((categoryId) => ({
                        boutiqueId: boutique.id,
                        categoryId,
                    })),
                }),
                prisma.boutique.update({
                    where: { id: boutique.id },
                    data: { storeCategoryId: uniqueIds[0] },
                }),
            ]);
        }

        const updated = await prisma.boutique.update({
            where: { ownerId: userId },
            data: {
                ...(input.storeName ? { name: input.storeName } : {}),
                ...(input.storeDescription !== undefined ? { description: input.storeDescription } : {}),
                ...(input.storeLogoUrl !== undefined ? { logoUrl: input.storeLogoUrl } : {}),
                ...(input.storeCoverUrl !== undefined ? { coverUrl: input.storeCoverUrl } : {}),
                ...(input.metaTitle !== undefined ? { metaTitle: input.metaTitle } : {}),
                ...(input.metaDescription !== undefined ? { metaDescription: input.metaDescription } : {}),
                ...(input.metaKeywords !== undefined ? { metaKeywords: input.metaKeywords } : {}),
                ...(input.ogImageUrl !== undefined ? { ogImageUrl: input.ogImageUrl } : {}),
            },
            select: {
                id: true,
                storeCategoryId: true,
                name: true,
                description: true,
                logoUrl: true,
                coverUrl: true,
                metaTitle: true,
                metaDescription: true,
                metaKeywords: true,
                ogImageUrl: true,
                storeCategory: { select: { id: true, name: true, slug: true } },
                categories: {
                    select: {
                        category: { select: { id: true, name: true, slug: true } },
                    },
                },
                _count: { select: { products: true } },
            },
        });

        return {
            id: updated.id,
            storeName: updated.name,
            description: updated.description,
            logoUrl: updated.logoUrl,
            coverUrl: updated.coverUrl,
            storeCategoryId: updated.storeCategoryId,
            storeCategory: updated.storeCategory,
            categories: updated.categories.map((c) => c.category),
            seo: {
                metaTitle: updated.metaTitle,
                metaDescription: updated.metaDescription,
                metaKeywords: updated.metaKeywords,
                ogImageUrl: updated.ogImageUrl,
            },
            productCount: updated._count.products,
        };
    }

    async getMyProfile(userId: string) {
        const boutique = await prisma.boutique.findUnique({
            where: { ownerId: userId },
            select: {
                id: true,
                storeCategoryId: true,
                name: true,
                description: true,
                logoUrl: true,
                coverUrl: true,
                metaTitle: true,
                metaDescription: true,
                metaKeywords: true,
                ogImageUrl: true,
                storeCategory: { select: { id: true, name: true, slug: true } },
                categories: {
                    select: {
                        category: { select: { id: true, name: true, slug: true } },
                    },
                },
                _count: { select: { products: true } },
            },
        });
        if (!boutique) throw new NotFoundError("Boutique");
        return {
            id: boutique.id,
            storeName: boutique.name ?? "",
            description: boutique.description ?? "",
            logoUrl: boutique.logoUrl,
            coverUrl: boutique.coverUrl,
            storeCategoryId: boutique.storeCategoryId,
            storeCategory: boutique.storeCategory,
            categories: boutique.categories.map((c) => c.category),
            seo: {
                metaTitle: boutique.metaTitle ?? `${boutique.name} - Boutique en ligne`,
                metaDescription: boutique.metaDescription ?? boutique.description,
                metaKeywords: boutique.metaKeywords ?? [],
                ogImageUrl: boutique.ogImageUrl ?? boutique.coverUrl ?? boutique.logoUrl,
            },
            productCount: boutique._count.products,
        };
    }

    private async repositoryProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!user) throw new NotFoundError("Utilisateur");
        return user;
    }

    async listProducts(userId: string, page: number, limit: number) {
        const [items, totalItems] = await this.repository.products(userId, (page - 1) * limit, limit);
        return { items, totalItems, page, limit, totalPages: Math.ceil(totalItems / limit) };
    }

    async createProduct(userId: string, input: CreateProductInput) {
        return productsService.create(input, userId, "SELLER");
    }

    async updateProduct(userId: string, id: string, input: UpdateProductInput) {
        return productsService.update(id, input, userId, "SELLER");
    }

    removeProduct(userId: string, id: string) {
        return productsService.remove(id, userId);
    }

    async requestProductDeletion(userId: string, productId: string, reason: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, boutique: { select: { ownerId: true } }, isActive: true },
        });
        if (!product) throw new NotFoundError("Produit");
        if (product.boutique.ownerId !== userId) {
            throw new ForbiddenError("Vous ne pouvez demander le retrait que de vos propres produits.");
        }
        if (!product.isActive) throw new ConflictError("Ce produit est déjà retiré de la boutique.");

        const pendingRequest = await prisma.productDeletionRequest.findFirst({
            where: { productId, sellerId: userId, status: "PENDING" },
            select: { id: true },
        });
        if (pendingRequest) throw new ConflictError("Une demande de retrait est déjà en attente pour ce produit.");

        return prisma.productDeletionRequest.create({
            data: { productId, sellerId: userId, reason },
            include: { product: { select: { id: true, title: true, sku: true } } },
        });
    }

    async listOrders(userId: string, page: number, limit: number) {
        const [items, totalItems] = await this.repository.orders(userId, (page - 1) * limit, limit);
        return { items, totalItems, page, limit, totalPages: Math.ceil(totalItems / limit) };
    }

    async getOrder(userId: string, id: string) {
        const item = await this.repository.order(userId, id);
        if (!item) throw new NotFoundError("Commande");
        return item;
    }

    async updateOrderStatus(userId: string, id: string, status: OrderStatus) {
        const order = await this.getOrder(userId, id);
        const hasOtherSellerItems = order.items.some((item) => (item.product as any).boutique?.ownerId !== userId);
        if (hasOtherSellerItems) {
            throw new ForbiddenError("Cette commande contient des articles d'un autre vendeur et ne peut pas être modifiée globalement.");
        }
        return prisma.order.update({ where: { id: order.id }, data: { status }, include: { items: true } });
    }

    feedback(userId: string) {
        return this.repository.feedback(userId);
    }

    stats(userId: string) {
        return this.repository.stats(userId);
    }

    async subscribe(userId: string, boutiqueOrSellerId: string) {
        const boutique = await prisma.boutique.findFirst({
            where: {
                OR: [
                    { id: boutiqueOrSellerId },
                    { ownerId: boutiqueOrSellerId },
                    { slug: boutiqueOrSellerId },
                ],
                isActive: true,
                deletedAt: null,
            },
            select: { id: true },
        });
        if (!boutique) throw new NotFoundError("Boutique non trouvée.");

        await prisma.subscription.upsert({
            where: {
                userId_boutiqueId: {
                    userId,
                    boutiqueId: boutique.id,
                },
            },
            create: {
                userId,
                boutiqueId: boutique.id,
            },
            update: {
                deletedAt: null,
            },
        });

        const subscriberCount = await prisma.subscription.count({
            where: { boutiqueId: boutique.id, deletedAt: null },
        });
        await prisma.boutique.update({
            where: { id: boutique.id },
            data: { subscriberCountCache: subscriberCount },
        });

        return { subscribed: true, subscriberCount };
    }

    async unsubscribe(userId: string, boutiqueOrSellerId: string) {
        const boutique = await prisma.boutique.findFirst({
            where: {
                OR: [
                    { id: boutiqueOrSellerId },
                    { ownerId: boutiqueOrSellerId },
                    { slug: boutiqueOrSellerId },
                ],
            },
            select: { id: true },
        });
        if (!boutique) throw new NotFoundError("Boutique non trouvée.");

        await prisma.subscription.deleteMany({
            where: { userId, boutiqueId: boutique.id },
        });

        const subscriberCount = await prisma.subscription.count({
            where: { boutiqueId: boutique.id, deletedAt: null },
        });
        await prisma.boutique.update({
            where: { id: boutique.id },
            data: { subscriberCountCache: subscriberCount },
        });

        return { subscribed: false, subscriberCount };
    }

    async getUserSubscriptions(userId: string) {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId, deletedAt: null },
            include: {
                boutique: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true,
                        coverUrl: true,
                        description: true,
                        subscriberCountCache: true,
                        ratingCache: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return subscriptions.map((s) => ({
            id: s.id,
            createdAt: s.createdAt,
            boutique: s.boutique,
        }));
    }
}

export const sellerService = new SellerService(sellerRepository);
