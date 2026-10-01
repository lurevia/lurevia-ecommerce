import { cartRepository, type CartRepository } from "../repository/cart.repository";
import { productsRepository } from "../../products/repository/products.repository";
import { BadRequestError, NotFoundError } from "../../../errors/AppError";
import type { CartItemQuery } from "../dto";
import { assertProductPurchasable } from "../lib/helper/cart.helper";
import { cartMapper } from "../mapper/cart.mapper";

export class CartService {
    constructor(
        private readonly repository: CartRepository
    ) { }

    async get(userId: string) {
        const items = await this.repository.findByUser(userId);
        return cartMapper.toOutput(items);
    }

    async addItem(
        userId: string,
        productId: string,
        quantity: number,
        variants: CartItemQuery
    ) {
        const product = await productsRepository.findById(productId);
        if (!product) throw new NotFoundError("Produit");

        assertProductPurchasable(product);

        if (product.stock <= 0) {
            throw new BadRequestError("Ce produit est en rupture de stock.");
        }

        if (variants.colorId) {
            const color = await productsRepository.findColorById(variants.colorId);
            if (!color || color.productId !== productId) {
                throw new BadRequestError("Couleur invalide pour ce produit.");
            }
        }

        if (variants.sizeId) {
            const size = await productsRepository.findSizeById(variants.sizeId);
            if (!size || size.productId !== productId) {
                throw new BadRequestError("Taille invalide pour ce produit.");
            }
        }

        const existing = await this.repository.findOne({
            userId,
            productId,
            colorId: variants.colorId ?? null,
            sizeId: variants.sizeId ?? null,
        });

        const nextQuantity = Math.min(
            (existing?.quantity ?? 0) + quantity,
            product.stock
        );

        await this.repository.upsert(
            {
                userId,
                productId,
                colorId: variants.colorId ?? null,
                sizeId: variants.sizeId ?? null,
            },
            nextQuantity,
            { productId }
        );

        return this.get(userId);
    }

    async updateItem(
        userId: string,
        productId: string,
        quantity: number,
        variants: CartItemQuery
    ) {
        const key = {
            userId,
            productId,
            colorId: variants.colorId ?? null,
            sizeId: variants.sizeId ?? null,
        };

        if (quantity <= 0) {
            await this.repository.delete(key);
            return this.get(userId);
        }

        const product = await productsRepository.findById(productId);
        if (!product) throw new NotFoundError("Produit");

        assertProductPurchasable(product);

        if (product.stock <= 0) {
            throw new BadRequestError("Ce produit est en rupture de stock.");
        }

        const cappedQuantity = Math.min(quantity, product.stock);
        await this.repository.upsert(key, cappedQuantity, { productId });

        return this.get(userId);
    }

    async removeItem(
        userId: string,
        productId: string,
        variants: CartItemQuery
    ) {
        await this.repository.delete({
            userId,
            productId,
            colorId: variants.colorId ?? null,
            sizeId: variants.sizeId ?? null,
        });
        return this.get(userId);
    }

    async clear(userId: string) {
        await this.repository.clear(userId);
        return this.get(userId);
    }
}

export const cartService = new CartService(cartRepository);
