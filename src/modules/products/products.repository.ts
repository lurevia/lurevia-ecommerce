import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type { ListProductsQuery } from "./products.validators";

/** Inclusion standard utilisée partout où un produit complet est renvoyé au client. */
export const productDetailInclude = {
  images: { orderBy: { position: "asc" } },
  colors: true,
  sizes: true,
  categories: { include: { category: true } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

const buildWhere = async (query: Pick<
  ListProductsQuery,
  | "categories" | "sizes" | "colors" | "priceMin" | "priceMax" | "availability"
  | "search" | "categoryId" | "priceRange" | "stock" | "status"
>): Promise<Prisma.ProductWhereInput> => {
  const where: Prisma.ProductWhereInput = {};

  if (query.categories?.length) {
    where.categories = { some: { category: { slug: { in: query.categories } } } };
  }

  if (query.categoryId) {
    where.categories = { some: { categoryId: query.categoryId } };
  }

  if (query.sizes?.length) {
    where.sizes = { some: { value: { in: query.sizes, mode: "insensitive" } } };
  }

  if (query.colors?.length) {
    where.colors = { some: { label: { in: query.colors, mode: "insensitive" } } };
  }

  const range = query.priceRange?.split("-").map(Number);
  if (query.priceMin !== undefined || query.priceMax !== undefined || range) {
    where.price = {
      ...(query.priceMin !== undefined || range ? { gte: query.priceMin ?? range?.[0] } : {}),
      ...(query.priceMax !== undefined || range ? { lte: query.priceMax ?? range?.[1] } : {}),
    };
  }

  if (query.stock === "out") where.stock = 0;
  if (query.stock === "low") where.stock = { gte: 1, lte: 5 };
  if (query.stock === "in") where.stock = { gte: 6, lte: 50 };
  if (query.stock === "high") where.stock = { gte: 50 };
  if (query.status === "new") where.isNew = true;
  if (query.status === "promo") where.originalPrice = { not: null };

  if (query.availability === "in-stock") where.stock = { gt: 0 };
  if (query.availability === "out-of-stock") where.stock = { lte: 0 };

  if (query.search) {
    const tagMatches = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "products"
      WHERE EXISTS (
        SELECT 1 FROM unnest("tags") AS tag(value)
        WHERE tag.value ILIKE ${`%${query.search}%`}
      )
    `);
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { sku: { contains: query.search, mode: "insensitive" } },
      { id: { in: tagMatches.map(({ id }) => id) } },
    ];
  }

  return where;
};

const buildOrderBy = (sortBy: ListProductsQuery["sortBy"]): Prisma.ProductOrderByWithRelationInput => {
  switch (sortBy) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating-desc":
      return { ratingCache: "desc" };
    // "Popularité" approximée par le nombre d'avis reçus — une vraie mesure
    // (compteur de vues, ventes) demanderait une table d'événements dédiée,
    // hors du périmètre actuel.
    case "popular":
      return { reviewCountCache: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};

export const productsRepository = {
  findManyByOwner: (ownerId: string, skip: number, take: number) =>
    prisma.$transaction([
      prisma.product.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" }, skip, take, include: productDetailInclude }),
      prisma.product.count({ where: { ownerId } }),
    ]),
  async findMany(query: ListProductsQuery) {
    const where = await buildWhere(query);
    const orderBy = query.status === "popular"
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
  },

  findById: (id: string) =>
    prisma.product.findUnique({ where: { id }, include: productDetailInclude }),

  findBySlug: (slug: string) =>
    prisma.product.findUnique({ where: { slug }, include: productDetailInclude }),

  findBySku: (sku: string) => prisma.product.findUnique({ where: { sku } }),

  /** Produits liés : même catégorie(s), en excluant le produit courant, triés par note. */
  findRelated: (productId: string, categoryIds: string[], limit: number) =>
    prisma.product.findMany({
      where: {
        id: { not: productId },
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      orderBy: { ratingCache: "desc" },
      take: limit,
      include: productDetailInclude,
    }),

  searchSuggestions: (query: string, limit: number) =>
    prisma.product.findMany({
      where: { title: { contains: query, mode: "insensitive" } },
      orderBy: { reviewCountCache: "desc" },
      take: limit,
      select: { id: true, title: true, price: true, images: { take: 1, orderBy: { position: "asc" } } },
    }),

  create: (data: Prisma.ProductCreateInput) =>
    prisma.product.create({ data, include: productDetailInclude }),

  update: (id: string, data: Prisma.ProductUpdateInput) =>
    prisma.product.update({ where: { id }, data, include: productDetailInclude }),

  delete: (id: string) => prisma.product.delete({ where: { id } }),

  replaceRelations: (
    productId: string,
    relations: {
      images?: string[];
      colors?: { label: string; hex: string }[];
      sizes?: string[];
      categoryIds?: string[];
    }
  ) =>
    prisma.$transaction(async (tx) => {
      if (relations.images) {
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.productImage.createMany({
          data: relations.images.map((url, position) => ({ productId, url, position })),
        });
      }
      if (relations.colors) {
        await tx.productColor.deleteMany({ where: { productId } });
        await tx.productColor.createMany({
          data: relations.colors.map((c) => ({ productId, label: c.label, hex: c.hex })),
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
          data: relations.categoryIds.map((categoryId) => ({ productId, categoryId })),
        });
      }
    }),

  /** Recalcule et persiste la moyenne/compte des avis — appelé après chaque écriture d'avis. */
  refreshRatingCache: async (productId: string) => {
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
  },
};
