import slugify from "slugify";
import { categoriesRepository } from "./categories.repository";
import { ConflictError, NotFoundError } from "../../errors/AppError";
import type {
  CreateCategoryInput,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from "./categories.validators";
import type { Category } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const toSlug = (name: string) =>
  slugify(name, { lower: true, strict: true, locale: "fr" });

/**
 * ✅ Génère un slug unique en suffixant -2, -3... en cas de collision.
 * Évite les erreurs 409 si l'admin veut "Artisanat" alors qu'il existe déjà.
 */
const generateUniqueSlug = async (
  name: string,
  excludeId?: string
): Promise<string> => {
  const base = toSlug(name);
  let candidate = base;
  let suffix = 2;

  for (;;) {
    const existing = await categoriesRepository.findBySlug(candidate);
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
};

/**
 * DTO de sortie : expose uniquement les champs publics + productCount.
 */
interface CategoryDto {
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

const toCategoryDto = (
  category: Category & { _count?: { products: number } }
): CategoryDto => ({
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
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const categoriesService = {
  async list() {
    const categories = await categoriesRepository.findAll();
    return categories.map(toCategoryDto);
  },

  async getBySlug(slug: string) {
    const category = await categoriesRepository.findBySlug(slug);
    if (!category) throw new NotFoundError("Catégorie");
    return toCategoryDto(category);
  },

  async getById(id: string) {
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError("Catégorie");
    return toCategoryDto(category);
  },

  async create(input: CreateCategoryInput) {
    const slug = await generateUniqueSlug(input.name);

    // Si la position n'est pas fournie, on met la catégorie à la fin
    const position =
      input.position > 0
        ? input.position
        : (await categoriesRepository.getMaxPosition()) + 1;

    const created = await categoriesRepository.create({
      ...input,
      slug,
      position,
    });

    return toCategoryDto(created);
  },

  async update(id: string, input: UpdateCategoryInput) {
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError("Catégorie");

    const data: UpdateCategoryInput & { slug?: string } = { ...input };

    // Régénère le slug si le nom change
    if (input.name && input.name !== category.name) {
      data.slug = await generateUniqueSlug(input.name, id);
    }

    const updated = await categoriesRepository.update(id, data);
    return toCategoryDto(updated);
  },

  async remove(id: string) {
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError("Catégorie");

    const productCount = await categoriesRepository.countProducts(id);
    if (productCount > 0) {
      throw new ConflictError(
        `Impossible de supprimer : ${productCount} produit(s) sont encore rattachés à cette catégorie.`
      );
    }

    await categoriesRepository.delete(id);
  },

  // ✅ Réordonner en masse (drag & drop côté admin)
  async reorder(input: ReorderCategoriesInput) {
    await categoriesRepository.reorder(input.items);
    return categoriesService.list();
  },
};