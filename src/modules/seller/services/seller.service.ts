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

    async apply(userId: string, input: { type: "PERCENTAGE" | "MONTHLY_FIXED"; value: number; storeName: string; storeDescription: string; storeCategoryId: string; storeLogoUrl?: string; storeCoverUrl?: string; }) {
        return prisma.$transaction(async (tx) => {
            const category = await tx.category.findUnique({ where: { id: input.storeCategoryId }, select: { id: true } });
            if (!category) throw new NotFoundError("Catégorie de boutique");
            const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isVerified: true } });
            if (!user) throw new NotFoundError("Utilisateur");
            if (!user.isVerified) throw new ForbiddenError("Votre compte doit être vérifié avant de devenir vendeur.");
            if (user.role === "SELLER") throw new ConflictError("Vous êtes déjà vendeur.");
            if (user.role !== "CUSTOMER") throw new ForbiddenError("Ce compte ne peut pas devenir vendeur.");

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    role: "SELLER",
                },
            });
            const slugCandidate = input.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            await tx.boutique.upsert({
                where: { ownerId: userId },
                create: {
                    ownerId: userId,
                    name: input.storeName,
                    slug: slugCandidate || `boutique-${userId.slice(0, 8)}`,
                    description: input.storeDescription,
                    logoUrl: input.storeLogoUrl,
                    coverUrl: input.storeCoverUrl,
                    storeCategoryId: category.id,
                },
                update: {
                    name: input.storeName,
                    description: input.storeDescription,
                    logoUrl: input.storeLogoUrl,
                    coverUrl: input.storeCoverUrl,
                    storeCategoryId: category.id,
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
                    type: input.type,
                    value: input.value,
                },
            });
            return { user: updatedUser, contract };
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
        return {
            id: seller.id,
            storeName: seller.name,
            description: seller.description,
            logoUrl: seller.logoUrl,
            coverUrl: seller.coverUrl,
            storeCategoryId: seller.storeCategoryId,
            storeCategory: seller.storeCategory,
            products: productsMapper.toOutputList(seller.products),
        };
    }

    async updateProfile(userId: string, input: UpdateSellerProfileInput) {
        const boutique = await prisma.boutique.findUnique({
            where: { ownerId: userId },
            select: { id: true, storeCategoryId: true, _count: { select: { products: true } } },
        });
        if (!boutique) throw new NotFoundError("Boutique non trouvée.");
        if (input.storeCategoryId && input.storeCategoryId !== boutique.storeCategoryId) {
            if (boutique._count.products > 0) {
                throw new ConflictError("La catégorie de boutique ne peut plus changer après la création de produits.");
            }
            const category = await prisma.category.findUnique({ where: { id: input.storeCategoryId }, select: { id: true } });
            if (!category) throw new NotFoundError("Catégorie de boutique");
        }
        const updated = await prisma.boutique.update({
            where: { ownerId: userId },
            data: {
                ...(input.storeName ? { name: input.storeName } : {}),
                ...(input.storeDescription !== undefined ? { description: input.storeDescription } : {}),
                ...(input.storeLogoUrl !== undefined ? { logoUrl: input.storeLogoUrl } : {}),
                ...(input.storeCoverUrl !== undefined ? { coverUrl: input.storeCoverUrl } : {}),
                ...(input.storeCategoryId ? { storeCategoryId: input.storeCategoryId } : {}),
            },
            select: {
                id: true,
                storeCategoryId: true,
                name: true,
                description: true,
                logoUrl: true,
                coverUrl: true,
                storeCategory: { select: { id: true, name: true, slug: true } },
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
                storeCategory: { select: { id: true, name: true, slug: true } },
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
