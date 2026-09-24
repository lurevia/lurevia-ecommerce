import type { ProductWithRelations } from "./products.repository";

export interface ProductDto {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string | null;
  longDescription: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  outOfStock: boolean;
  isNew: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  images: string[];
  colors: { label: string; hex: string }[];
  sizes: string[];
  categorySlugs: string[];
  createdAt: string;
}

export const toProductDto = (product: ProductWithRelations): ProductDto => ({
  id: product.id,
  title: product.title,
  slug: product.slug,
  sku: product.sku,
  description: product.description,
  longDescription: product.longDescription,
  price: product.price ?? 0,
  originalPrice: product.originalPrice,
  stock: product.stock,
  outOfStock: product.stock <= 0,
  isNew: product.isNew,
  tags: product.tags,
  rating: Math.round(product.ratingCache * 10) / 10,
  reviewCount: product.reviewCountCache,
  imageUrl: product.images[0]?.url ?? null,
  images: product.images.map((i) => i.url),
  colors: product.colors.map((c) => ({ label: c.label, hex: c.hex })),
  sizes: product.sizes.map((s) => s.value),
  categorySlugs: product.categories.map((pc) => pc.category.slug),
  createdAt: product.createdAt.toISOString(),
});
