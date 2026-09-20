import slugify from "slugify";
import { categoriesRepository } from "./categories.repository";
import { ConflictError, NotFoundError } from "../../errors/AppError";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.validators";

const toSlug = (name: string) => slugify(name, { lower: true, strict: true, locale: "fr" });

export const categoriesService = {
  list: () => categoriesRepository.findAll(),

  async getBySlug(slug: string) {
    const category = await categoriesRepository.findBySlug(slug);
    if (!category) throw new NotFoundError("Catégorie");
    return category;
  },

  async create(input: CreateCategoryInput) {
    const slug = toSlug(input.name);
    const existing = await categoriesRepository.findBySlug(slug);
    if (existing) throw new ConflictError("Une catégorie avec ce nom existe déjà.");
    return categoriesRepository.create({ ...input, slug });
  },

  async update(id: string, input: UpdateCategoryInput) {
    const category = await categoriesRepository.findById(id);
    if (!category) throw new NotFoundError("Catégorie");

    const data: UpdateCategoryInput & { slug?: string } = { ...input };
    if (input.name && input.name !== category.name) {
      const slug = toSlug(input.name);
      const existing = await categoriesRepository.findBySlug(slug);
      if (existing && existing.id !== id) throw new ConflictError("Une catégorie avec ce nom existe déjà.");
      data.slug = slug;
    }

    return categoriesRepository.update(id, data);
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
};
