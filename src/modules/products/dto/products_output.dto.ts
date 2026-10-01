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

  colors: { label: string; hex: string; }[];
  sizes: string[];

  categoryIds: string[];
  categories: { id: string; name: string; slug: string; }[];
  categorySlugs: string[];

  ownerId: string | null;

  createdAt: string;
  updatedAt: string;
}
