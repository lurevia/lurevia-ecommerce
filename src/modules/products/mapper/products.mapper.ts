import { type ProductWithRelations } from "../lib/type/products.type";
import { type ProductDto } from "../dto/products_output.dto";

export class ProductsMapper {
  toOutput(product: ProductWithRelations): ProductDto {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      longDescription: product.longDescription,

      pricingMode: product.pricingMode,

      price: product.price,
      originalPrice: product.originalPrice,
      minPrice: product.minPrice,
      maxPrice: product.maxPrice,

      auction:
        product.pricingMode === "AUCTION"
          ? {
            startPrice: product.auctionStartPrice,
            currentPrice: product.auctionCurrentPrice,
            reservePrice: product.auctionReservePrice,
            startAt: product.auctionStartAt?.toISOString() ?? null,
            endAt: product.auctionEndAt?.toISOString() ?? null,
            status: product.auctionStatus,
            bidCount: product.auctionBidCount,
            watcherCount: product.auctionWatcherCount,
            winnerId: product.auctionWinnerId,
            finalPrice: product.auctionFinalPrice,
          }
          : null,

      // Stock
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      inStock: product.stock > 0,
      isNew: product.isNew,
      isActive: product.isActive,

      // Stat
      tags: product.tags,
      rating: Math.round(product.ratingCache * 10) / 10,
      reviewCount: product.reviewCountCache,

      // Médias
      imageUrl: product.images[0]?.url ?? null,
      images: product.images.map((i) => i.url),

      // Variantes
      colors: product.colors.map((c) => ({ label: c.label, hex: c.hex })),
      sizes: product.sizes.map((s) => s.value),

      // Catégories
      categoryIds: product.categories.map((pc) => pc.categoryId),
      categories: product.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      categorySlugs: product.categories.map((pc) => pc.category.slug),

      // Vendeur
      ownerId: product.ownerId,

      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  toOutputList(items: ProductWithRelations[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const productsMapper = new ProductsMapper();
