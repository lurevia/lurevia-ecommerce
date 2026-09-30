import type { ProductWithRelations } from "./products.repository";

export interface ProductDto {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string | null;
  longDescription: string | null;

  pricingMode: string;

  price: number | null;
  originalPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;

  auction: {
    startPrice: number | null;
    currentPrice: number | null;
    reservePrice: number | null;
    startAt: string | null;
    endAt: string | null;
    status: string | null;
    bidCount: number;
    watcherCount: number;
    winnerId: string | null;
    finalPrice: number | null;
  } | null;

  stock: number;
  lowStockThreshold: number;
  inStock: boolean;
  isNew: boolean;
  isActive: boolean;

  tags: string[];
  rating: number;
  reviewCount: number;

  imageUrl: string | null;
  images: string[];

  colors: { label: string; hex: string }[];
  sizes: string[];

  categoryIds: string[];
  categories: { id: string; name: string; slug: string }[];
  categorySlugs: string[];

  ownerId: string | null;

  createdAt: string;
  updatedAt: string;
}

export const toProductDto = (product: ProductWithRelations): ProductDto => ({
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
});