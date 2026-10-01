import { prisma } from "../../../lib/prisma";
import { productDetailInclude } from "../../products/lib/constant/products.constant";
import { type CartItemKey } from "../lib/type/cart.type";

export class CartRepository {
    /**
     * Récupère tout le panier d'un utilisateur avec les détails produit.
     */
    findByUser(userId: string) {
        return prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: { include: productDetailInclude },
                color: { select: { id: true, label: true, hex: true } },
                size: { select: { id: true, value: true } },
            },
            orderBy: { createdAt: "asc" },
        });
    }

    /**
     * Trouve un article précis (avec variantes).
     */
    findOne({ userId, productId, colorId, sizeId }: CartItemKey) {
        return prisma.cartItem.findFirst({
            where: {
                userId,
                productId,
                colorId: colorId ?? null,
                sizeId: sizeId ?? null,
            },
        });
    }

    /**
     * Ajoute ou met à jour un article avec variantes.
     *
     * Le `upsert` Prisma natif est capricieux avec les clés composites dont
     * certains champs sont nullables. On utilise une transaction manuelle
     * pour un comportement fiable.
     */
    async upsert(
        key: CartItemKey,
        quantity: number,
        productSnapshot: { productId: string; }
    ) {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.cartItem.findFirst({
                where: {
                    userId: key.userId,
                    productId: key.productId,
                    colorId: key.colorId ?? null,
                    sizeId: key.sizeId ?? null,
                },
            });

            if (existing) {
                return tx.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity },
                });
            }

            return tx.cartItem.create({
                data: {
                    userId: key.userId,
                    productId: productSnapshot.productId,
                    colorId: key.colorId,
                    sizeId: key.sizeId,
                    quantity,
                },
            });
        });
    }

    /**
     * Supprime un article précis (avec variantes).
     */
    delete({ userId, productId, colorId, sizeId }: CartItemKey) {
        return prisma.cartItem.deleteMany({
            where: {
                userId,
                productId,
                colorId: colorId ?? null,
                sizeId: sizeId ?? null,
            },
        });
    }

    /**
     * Vide tout le panier.
     */
    clear(userId: string) {
        return prisma.cartItem.deleteMany({ where: { userId } });
    }

    /**
     * Compte le nombre d'articles dans le panier (utile pour badge UI).
     */
    countByUser(userId: string) {
        return prisma.cartItem.aggregate({
            where: { userId },
            _sum: { quantity: true },
        });
    }

    findColorById(id: string) {
        return prisma.productColor.findUnique({ where: { id } });
    }

    findSizeById(id: string) {
        return prisma.productSize.findUnique({ where: { id } });
    }
}

export const cartRepository = new CartRepository();
