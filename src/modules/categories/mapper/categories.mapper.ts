import type { Category } from "@prisma/client";
import type { CategoryOutput } from "../dto/index";

export type CategoryWithCount = Category & {
  _count?: { products: number };
};

export class CategoriesMapper {
  toOutput(category: CategoryWithCount): CategoryOutput {
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

  toOutputList(categories: CategoryWithCount[]): CategoryOutput[] {
    return categories.map((category) => this.toOutput(category));
  }
}

export const categoriesMapper = new CategoriesMapper();