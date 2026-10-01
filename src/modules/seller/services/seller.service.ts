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

    async apply(userId: string, input: { type: "PERCENTAGE" | "MONTHLY_FIXED"; value: number; storeName: string; storeDescription: string; storeLogoUrl?: string; }) {
        return prisma.$transaction(async (tx) => {
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
            products: productsMapper.toOutputList(seller.ownedProducts),
        };
    }

    async updateProfile(userId: string, input: UpdateSellerProfileInput) {
        const seller = await this.repositoryProfile(userId);
        if (seller.role !== "SELLER") {
            throw new ForbiddenError("Seuls les vendeurs peuvent modifier leur boutique.");
        }
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                publicStoreName: input.storeName,
                publicStoreDescription: input.storeDescription,
                publicStoreLogoUrl: input.storeLogoUrl,
            },
            select: {
                id: true,
                publicStoreName: true,
                publicStoreDescription: true,
                publicStoreLogoUrl: true,
            },
        });
        return {
            id: updated.id,
            storeName: updated.publicStoreName,
            description: updated.publicStoreDescription,
            logoUrl: updated.publicStoreLogoUrl,
        };
    }

    async getMyProfile(userId: string) {
        const seller = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                publicStoreName: true,
                publicStoreDescription: true,
                publicStoreLogoUrl: true,
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

    createProduct(userId: string, input: CreateProductInput) {
        return productsService.create(input, userId);
    }

    updateProduct(userId: string, id: string, input: UpdateProductInput) {
        return productsService.update(id, input, userId);
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
