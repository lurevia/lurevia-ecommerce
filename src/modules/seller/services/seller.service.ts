import type { OrderStatus } from "@prisma/client";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { prisma } from "../../../lib/prisma";
import { productsService } from "../../products/services/products.service";
import { sellerRepository, type SellerRepository } from "../repository/seller.repository";
import type { CreateProductInput, UpdateProductInput } from "../../products/validator/products.validator";

export class SellerService {
    constructor(
        private readonly repository: SellerRepository
    ) { }

    async apply(userId: string, input: { type: "PERCENTAGE" | "MONTHLY_FIXED"; value: number; }) {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isVerified: true } });
            if (!user) throw new NotFoundError("Utilisateur");
            if (!user.isVerified) throw new ForbiddenError("Votre compte doit être vérifié avant de devenir vendeur.");
            if (user.role === "SELLER") throw new ConflictError("Vous êtes déjà vendeur.");
            if (user.role !== "CUSTOMER") throw new ForbiddenError("Ce compte ne peut pas devenir vendeur.");

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { role: "SELLER" },
            });
            const contract = await tx.sellerContract.create({
                data: { sellerId: userId, version: 1, type: input.type, value: input.value },
            });
            return { user: updatedUser, contract };
        });
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
