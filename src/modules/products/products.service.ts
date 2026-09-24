import { productsRepository } from "./products.repository";
import { toProductDto } from "./products.mapper";
import { buildPaginatedResult } from "../../utils/pagination";
import { generateUniqueProductSlug } from "../../utils/slug";
import { ConflictError, NotFoundError } from "../../errors/AppError";
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from "./products.validators";

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

  async create(input: CreateProductInput, ownerId?: string) {
    const existingSku = await productsRepository.findBySku(input.sku);
    if (existingSku) throw new ConflictError("Ce SKU est déjà utilisé.");

    const slug = await generateUniqueProductSlug(input.title);

    const product = await productsRepository.create({
      ...(ownerId ? { owner: { connect: { id: ownerId } } } : {}),
      title: input.title,
      slug,
      sku: input.sku,
      description: input.description,
      longDescription: input.longDescription,
      price: input.price,
      originalPrice: input.originalPrice,
      stock: input.stock,
      isNew: input.isNew,
      tags: input.tags,
      images: { create: input.images.map((url, position) => ({ url, position })) },
      colors: { create: input.colors },
      sizes: { create: input.sizes.map((value) => ({ value })) },
      categories: { create: input.categoryIds.map((categoryId) => ({ categoryId })) },
    });

    return toProductDto(product);
  },

  async update(id: string, input: UpdateProductInput, ownerId?: string) {
    const existing = await productsRepository.findById(id);
    if (!existing) throw new NotFoundError("Produit");
    if (ownerId && existing.ownerId !== ownerId) throw new NotFoundError("Produit");

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
      price: input.price,
      originalPrice: input.originalPrice,
      stock: input.stock,
      isNew: input.isNew,
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

  async remove(id: string, ownerId?: string) {
    const existing = await productsRepository.findById(id);
    if (!existing) throw new NotFoundError("Produit");
    if (ownerId && existing.ownerId !== ownerId) throw new NotFoundError("Produit");
    await productsRepository.delete(id);
  },
};
