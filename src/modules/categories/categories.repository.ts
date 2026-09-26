import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const categoriesRepository = {
  findAll: () => prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  }),

  findBySlug: (slug: string) => prisma.category.findUnique({ where: { slug } }),

  findById: (id: string) => prisma.category.findUnique({ where: { id } }),

  create: (data: Prisma.CategoryCreateInput) => prisma.category.create({ data }),

  update: (id: string, data: Prisma.CategoryUpdateInput) =>
    prisma.category.update({ where: { id }, data }),

  delete: (id: string) => prisma.category.delete({ where: { id } }),

  countProducts: (id: string) => prisma.productCategory.count({ where: { categoryId: id } }),
};
