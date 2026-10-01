import type { Category } from "@prisma/client";
import { type CategoryDto } from "../dto/categories_output.dto";

export class CategoriesMapper {
  toOutput(category: Category & { _count?: { products: number; }; }): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      bannerUrl: category.bannerUrl,
      iconName: category.iconName,
      position: category.position,
      productCount: category._count?.products ?? 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  toOutputList(items: Category & { _count?: { products: number; }; }[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const categoriesMapper = new CategoriesMapper();
