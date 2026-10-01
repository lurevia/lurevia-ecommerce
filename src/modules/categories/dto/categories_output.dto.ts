/**
 * DTO de sortie : expose uniquement les champs publics + productCount.
 */
export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
  iconName: string;
  position: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}
