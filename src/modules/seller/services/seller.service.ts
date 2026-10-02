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

    async apply(userId: string, input: { type: "PERCENTAGE" | "MONTHLY_FIXED"; value: number; storeName: string; storeDescription: string; storeCategoryId: string; storeLogoUrl?: string; }) {
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
                    publicStoreName: input.storeName,
                    publicStoreDescription: input.storeDescription,
                    publicStoreLogoUrl: input.storeLogoUrl,
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
            storeName: seller.publicStoreName!,
            description: seller.publicStoreDescription,
            logoUrl: seller.publicStoreLogoUrl,
            storeCategoryId: seller.storeCategoryId,
            storeCategory: seller.storeCategory,
            productCount: seller._count.ownedProducts,
        }));
        return buildPaginatedResult(sellers, totalItems, pagination);
    }

    async getPublicProfile(id: string) {
        const seller = await this.repository.publicProfile(id);
        if (!seller) throw new NotFoundError("Vendeur");
        return {
            id: seller.id,
            storeName: seller.publicStoreName!,
            description: seller.publicStoreDescription,
            logoUrl: seller.publicStoreLogoUrl,
            storeCategoryId: seller.storeCategoryId,
            storeCategory: seller.storeCategory,
            products: productsMapper.toOutputList(seller.ownedProducts),
        };
    }

    async updateProfile(userId: string, input: UpdateSellerProfileInput) {
        const seller = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, storeCategoryId: true, _count: { select: { ownedProducts: true } } },
        });
        if (!seller) throw new NotFoundError("Utilisateur");
        if (seller.role !== "SELLER") {
            throw new ForbiddenError("Seuls les vendeurs peuvent modifier leur boutique.");
        }
        if (input.storeCategoryId && input.storeCategoryId !== seller.storeCategoryId) {
            if (seller._count.ownedProducts > 0) {
                throw new ConflictError("La catégorie de boutique ne peut plus changer après la création de produits.");
            }
            const category = await prisma.category.findUnique({ where: { id: input.storeCategoryId }, select: { id: true } });
            if (!category) throw new NotFoundError("Catégorie de boutique");
        }
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                publicStoreName: input.storeName,
                publicStoreDescription: input.storeDescription,
                publicStoreLogoUrl: input.storeLogoUrl,
                ...(input.storeCategoryId ? { storeCategoryId: input.storeCategoryId } : {}),
            },
            select: {
                id: true,
                storeCategoryId: true,
                publicStoreName: true,
                publicStoreDescription: true,
                publicStoreLogoUrl: true,
                storeCategory: { select: { id: true, name: true, slug: true } },
                _count: { select: { ownedProducts: true } },
            },
        });
        return {
            id: updated.id,
            storeName: updated.publicStoreName,
            description: updated.publicStoreDescription,
            logoUrl: updated.publicStoreLogoUrl,
            storeCategoryId: updated.storeCategoryId,
            storeCategory: updated.storeCategory,
            productCount: updated._count.ownedProducts,
        };
    }

    async getMyProfile(userId: string) {
        const seller = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                storeCategoryId: true,
                publicStoreName: true,
                publicStoreDescription: true,
                publicStoreLogoUrl: true,
                storeCategory: { select: { id: true, name: true, slug: true } },
                _count: { select: { ownedProducts: true } },
            },
        });
        if (!seller) throw new NotFoundError("Utilisateur");
        if (seller.role !== "SELLER") {
            throw new ForbiddenError("Seuls les vendeurs peuvent consulter leur boutique.");
        }
        return {
            id: seller.id,
            storeName: seller.publicStoreName ?? "",
            description: seller.publicStoreDescription ?? "",
            logoUrl: seller.publicStoreLogoUrl,
            storeCategoryId: seller.storeCategoryId,
            storeCategory: seller.storeCategory,
            productCount: seller._count.ownedProducts,
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
        const hasOtherSellerItems = order.items.some((item) => item.product.ownerId !== userId);
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

}

export const sellerService = new SellerService(sellerRepository);
