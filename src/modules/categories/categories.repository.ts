import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const categoriesRepository = {
  findAll: () =>
    prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    }),

  findBySlug: (slug: string) =>
    prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    }),

  findById: (id: string) =>
    prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    }),

  create: (data: Prisma.CategoryCreateInput) =>
    prisma.category.create({ data }),

  update: (id: string, data: Prisma.CategoryUpdateInput) =>
    prisma.category.update({ where: { id }, data }),

  delete: (id: string) => prisma.category.delete({ where: { id } }),

  countProducts: (id: string) =>
    prisma.productCategory.count({ where: { categoryId: id } }),

  async reorder(items: Array<{ id: string; position: number }>) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );
  },

  async getMaxPosition(): Promise<number> {
    const result = await prisma.category.aggregate({
      _max: { position: true },
    });
    return result._max.position ?? 0;
  },
};