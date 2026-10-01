import { prisma } from "../../../lib/prisma";
import type { Prisma } from "@prisma/client";

export class CategoriesRepository {
    findAll() {
        return prisma.category.findMany({
            orderBy: [{ position: "asc" }, { name: "asc" }],
            include: { _count: { select: { products: true } } },
        });
    }

    findBySlug(slug: string) {
        return prisma.category.findUnique({
            where: { slug },
            include: { _count: { select: { products: true } } },
        });
    }

    findById(id: string) {
        return prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
    }

    create(data: Prisma.CategoryCreateInput) {
        return prisma.category.create({ data });
    }

    update(id: string, data: Prisma.CategoryUpdateInput) {
        return prisma.category.update({ where: { id }, data });
    }

    delete(id: string) {
        return prisma.category.delete({ where: { id } });
    }

    countProducts(id: string) {
        return prisma.productCategory.count({ where: { categoryId: id } });
    }

    async reorder(items: Array<{ id: string; position: number; }>) {
        return prisma.$transaction(
            items.map((item) =>
                prisma.category.update({
                    where: { id: item.id },
                    data: { position: item.position },
                })
            )
        );
    }

    async getMaxPosition(): Promise<number> {
        const result = await prisma.category.aggregate({
            _max: { position: true },
        });
        return result._max.position ?? 0;
    }
}

export const categoriesRepository = new CategoriesRepository();
