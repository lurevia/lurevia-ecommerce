import { productsRepository } from "./products.repository";
import { toProductDto } from "./products.mapper";
import { buildPaginatedResult } from "../../utils/pagination";
import { generateUniqueProductSlug } from "../../utils/slug";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/AppError";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "./products.validators";

const assertProductOwnership = async (
  productId: string,
  userId: string,
  userRole: string
) => {
  const product = await productsRepository.findById(productId);
  if (!product) throw new NotFoundError("Produit");
  if (userRole !== "ADMIN" && product.ownerId !== userId) {
    throw new ForbiddenError("Ce produit ne vous appartient pas.");
  }
  return product;
};

export const productsService = {
  async list(query: ListProductsQuery) {
    const { items, totalItems } = await productsRepository.findMany(query);
    return buildPaginatedResult(items.map(toProductDto), totalItems, query);
  },

  async getById(id: string) {
    const product = await productsRepository.findById(id);
    if (!product) throw new NotFoundError("Produit");
    return toProductDto(product);
  },

  async getBySlug(slug: string) {
    const product = await productsRepository.findBySlug(slug);
    if (!product) throw new NotFoundError("Produit");
    return toProductDto(product);
  },

  async getRelated(id: string, limit = 4) {
    const product = await productsRepository.findById(id);
    if (!product) throw new NotFoundError("Produit");

    const categoryIds = product.categories.map((pc) => pc.categoryId);
    if (categoryIds.length === 0) return [];

    const related = await productsRepository.findRelated(id, categoryIds, limit);
    return related.map(toProductDto);
  },

  async searchSuggestions(q: string, limit: number) {
    const results = await productsRepository.searchSuggestions(q, limit);
    return results.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      imageUrl: p.images[0]?.url ?? null,
    }));
  },

  async create(input: CreateProductInput, ownerId: string) {
    const existingSku = await productsRepository.findBySku(input.sku);
    if (existingSku) throw new ConflictError("Ce SKU est déjà utilisé.");

    const slug = await generateUniqueProductSlug(input.title);

    const product = await productsRepository.create({
      owner: { connect: { id: ownerId } },
      title: input.title,
      slug,
      sku: input.sku,
      description: input.description,
      longDescription: input.longDescription,
      pricingMode: input.pricingMode,

      // Prix
      price: input.price,
      originalPrice: input.originalPrice,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,

      // Enchère
      auctionStartPrice: input.auctionStartPrice,
      auctionReservePrice: input.auctionReservePrice,
      auctionStartAt: input.auctionStartAt,
      auctionEndAt: input.auctionEndAt,
      auctionStatus: input.pricingMode === "AUCTION" ? "ACTIVE" : null,

      // Stock
      stock: input.stock,
      lowStockThreshold: input.lowStockThreshold,
      isNew: input.isNew,
      isActive: input.isActive,
      tags: input.tags,

      images: {
        create: input.images.map((url, position) => ({ url, position })),
      },
      colors: { create: input.colors },
      sizes: { create: input.sizes.map((value) => ({ value })) },
      categories: {
        create: input.categoryIds.map((categoryId) => ({ categoryId })),
      },
    });

    return toProductDto(product);
  },

  async update(
    id: string,
    input: UpdateProductInput,
    userId: string,
    userRole = "SELLER"
  ) {
    const existing = await assertProductOwnership(id, userId, userRole);

    if (input.sku && input.sku !== existing.sku) {
      const skuTaken = await productsRepository.findBySku(input.sku);
      if (skuTaken) throw new ConflictError("Ce SKU est déjà utilisé.");
    }

    let slug: string | undefined;
    if (input.title && input.title !== existing.title) {
      slug = await generateUniqueProductSlug(input.title, id);
    }

    await productsRepository.update(id, {
      title: input.title,
      slug,
      sku: input.sku,
      description: input.description,
      longDescription: input.longDescription,
      pricingMode: input.pricingMode,

      price: input.price,
      originalPrice: input.originalPrice,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,

      auctionStartPrice: input.auctionStartPrice,
      auctionReservePrice: input.auctionReservePrice,
      auctionStartAt: input.auctionStartAt,
      auctionEndAt: input.auctionEndAt,

      stock: input.stock,
      lowStockThreshold: input.lowStockThreshold,
      isNew: input.isNew,
      isActive: input.isActive,
      tags: input.tags,
    });

    await productsRepository.replaceRelations(id, {
      images: input.images,
      colors: input.colors,
      sizes: input.sizes,
      categoryIds: input.categoryIds,
    });

    const updated = await productsRepository.findById(id);
    return toProductDto(updated!);
  },

  async remove(id: string, userId: string, userRole = "SELLER") {
    await assertProductOwnership(id, userId, userRole);
    await productsRepository.delete(id);
  },

  async listMine(ownerId: string, page?: number, limit?: number) {
    const p = {
      page: page ?? 1,
      limit: limit ?? 20,
    };
    const [items, totalItems] = await productsRepository.findManyByOwner(
      ownerId,
      (p.page - 1) * p.limit,
      p.limit
    );
    return buildPaginatedResult(
      items.map(toProductDto),
      totalItems,
      { page: p.page, limit: p.limit }
    );
  },
};