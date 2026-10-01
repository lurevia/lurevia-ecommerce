import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import type { ListProductsQuery } from "../dto";
import { productDetailInclude } from "../lib/constant/products.constant";
import { buildWhere, buildOrderBy } from "../lib/helper/products.helper";

export class ProductsRepository {
    findManyByOwner(ownerId: string, skip: number, take: number) {
        return prisma.$transaction([
            prisma.product.findMany({
                where: { ownerId },
                orderBy: { createdAt: "desc" },
                skip,
                take,
                include: productDetailInclude,
            }),
            prisma.product.count({ where: { ownerId } }),
        ]);
    }

    async findMany(query: ListProductsQuery & { includeInactive?: boolean; }) {
        const where = await buildWhere(query);

        if (!query.includeInactive) {
            where.isActive = true;
        }

        const orderBy =
            query.status === "popular"
                ? { reviewCountCache: "desc" as const }
                : buildOrderBy(query.sortBy);

        const skip = (query.page - 1) * query.limit;

        const [items, totalItems] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: query.limit,
                include: productDetailInclude,
            }),
            prisma.product.count({ where }),
        ]);

        return { items, totalItems };
    }

    findById(id: string) {
        return prisma.product.findUnique({
            where: { id },
            include: productDetailInclude,
        });
    }

    findBySlug(slug: string) {
        return prisma.product.findUnique({
            where: { slug },
            include: productDetailInclude,
        });
    }

    findBySku(sku: string) {
        return prisma.product.findUnique({ where: { sku } });
    }

    findRelated(productId: string, categoryIds: string[], limit: number) {
        return prisma.product.findMany({
            where: {
                id: { not: productId },
                categories: { some: { categoryId: { in: categoryIds } } },
            },
            orderBy: { ratingCache: "desc" },
            take: limit,
            include: productDetailInclude,
        });
    }

    searchSuggestions(query: string, limit: number) {
        return prisma.product.findMany({
            where: { title: { contains: query, mode: "insensitive" } },
            orderBy: { reviewCountCache: "desc" },
            take: limit,
            select: {
                id: true,
                title: true,
                price: true,
                images: { take: 1, orderBy: { position: "asc" } },
            },
        });
    }

    create(data: Prisma.ProductCreateInput) {
        return prisma.product.create({ data, include: productDetailInclude });
    }

    update(id: string, data: Prisma.ProductUpdateInput) {
        return prisma.product.update({
            where: { id },
            data,
            include: productDetailInclude,
        });
    }

    delete(id: string) {
        return prisma.product.delete({ where: { id } });
    }

    replaceRelations(productId: string,
        relations: {
            images?: string[];
            colors?: { label: string; hex: string; }[];
            sizes?: string[];
            categoryIds?: string[];
        }) {
        return prisma.$transaction(async (tx) => {
            if (relations.images) {
                await tx.productImage.deleteMany({ where: { productId } });
                await tx.productImage.createMany({
                    data: relations.images.map((url, position) => ({
                        productId,
                        url,
                        position,
                    })),
                });
            }
            if (relations.colors) {
                await tx.productColor.deleteMany({ where: { productId } });
                await tx.productColor.createMany({
                    data: relations.colors.map((c) => ({
                        productId,
                        label: c.label,
                        hex: c.hex,
                    })),
                });
            }
            if (relations.sizes) {
                await tx.productSize.deleteMany({ where: { productId } });
                await tx.productSize.createMany({
                    data: relations.sizes.map((value) => ({ productId, value })),
                });
            }
            if (relations.categoryIds) {
                await tx.productCategory.deleteMany({ where: { productId } });
                await tx.productCategory.createMany({
                    data: relations.categoryIds.map((categoryId) => ({
                        productId,
                        categoryId,
                    })),
                });
            }
        });
    }

    updateAuction(id: string, data: Prisma.ProductUpdateInput) {
        return prisma.product.update({
            where: { id },
            data,
            include: productDetailInclude,
        });
    }

    async refreshRatingCache(productId: string) {
        const aggregate = await prisma.productReview.aggregate({
            where: { productId, isApproved: true },
            _avg: { rating: true },
            _count: { rating: true },
        });
        return prisma.product.update({
            where: { id: productId },
            data: {
                ratingCache: aggregate._avg.rating ?? 0,
                reviewCountCache: aggregate._count.rating,
            },
        });
    }

    findColorById(id: string) {
        return prisma.productColor.findUnique({ where: { id } });
    }

    findSizeById(id: string) {
        return prisma.productSize.findUnique({ where: { id } });
    }
}

export const productsRepository = new ProductsRepository();
