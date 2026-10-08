import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import type { ListProductsQuery } from "../../dto";

export const buildWhere = async (
  query: Pick<
    ListProductsQuery,
    | "categories"
    | "sizes"
    | "colors"
    | "priceMin"
    | "priceMax"
    | "availability"
    | "search"
    | "categoryId"
    | "priceRange"
    | "stock"
    | "status"
    | "pricingMode"
    | "auctionStatus"
    | "ownerId"
  >
): Promise<Prisma.ProductWhereInput> => {
  const where: Prisma.ProductWhereInput = {};

  if (query.categories?.length) {
    where.categories = {
      some: { category: { slug: { in: query.categories } } },
    };
  }

  if (query.categoryId) {
    where.categories = { some: { categoryId: query.categoryId } };
  }

  if (query.sizes?.length) {
    where.sizes = {
      some: { value: { in: query.sizes, mode: "insensitive" } },
    };
  }

  if (query.colors?.length) {
    where.colors = {
      some: { label: { in: query.colors, mode: "insensitive" } },
    };
  }

  if (query.pricingMode) {
    where.pricingMode = query.pricingMode;
  }
  if (query.auctionStatus) {
    where.auctionStatus = query.auctionStatus;
  }
  if (query.ownerId) {
    where.boutique = { ownerId: query.ownerId };
  }

  const range = query.priceRange?.split("-").map(Number);
  if (query.priceMin !== undefined || query.priceMax !== undefined || range) {
    where.price = {
      ...(query.priceMin !== undefined || range
        ? { gte: query.priceMin ?? range?.[0] }
        : {}),
      ...(query.priceMax !== undefined || range
        ? { lte: query.priceMax ?? range?.[1] }
        : {}),
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
    const tagMatches = await prisma.$queryRaw<Array<{ id: string; }>>(
      Prisma.sql`
        SELECT "id" FROM "products"
        WHERE EXISTS (
          SELECT 1 FROM unnest("tags") AS tag(value)
          WHERE tag.value ILIKE ${`%${query.search}%`}
        )
      `
    );
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { sku: { contains: query.search, mode: "insensitive" } },
      { id: { in: tagMatches.map(({ id }) => id) } },
    ];
  }

  return where;
};

export const buildOrderBy = (
  sortBy: ListProductsQuery["sortBy"]
): Prisma.ProductOrderByWithRelationInput => {
  switch (sortBy) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating-desc":
      return { ratingCache: "desc" };
    case "popular":
      return { reviewCountCache: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};
