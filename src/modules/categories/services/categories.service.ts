import { categoriesRepository, type CategoriesRepository } from "../repository/categories.repository";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import type { CreateCategoryInput, ReorderCategoriesInput, UpdateCategoryInput } from "../dto";
import { categoriesMapper } from "../mapper/categories.mapper";
import { toSlug } from "../lib/helper/categories.helper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class CategoriesService {
    constructor(
        private readonly repository: CategoriesRepository
    ) { }

    async list() {
        const categories = await this.repository.findAll();
        return categoriesMapper.toOutputList(categories);
    }

    async getBySlug(slug: string) {
        const category = await this.repository.findBySlug(slug);
        if (!category) throw new NotFoundError("Catégorie");
        return categoriesMapper.toOutput(category);
    }

    async getById(id: string) {
        const category = await this.repository.findById(id);
        if (!category) throw new NotFoundError("Catégorie");
        return categoriesMapper.toOutput(category);
    }

    async create(input: CreateCategoryInput) {
        const slug = await this.generateUniqueSlug(input.name);

        // Si la position n'est pas fournie, on met la catégorie à la fin
        const position =
            input.position > 0
                ? input.position
                : (await this.repository.getMaxPosition()) + 1;

        const created = await this.repository.create({
            ...input,
            slug,
            position,
        });

        return categoriesMapper.toOutput(created);
    }

    async update(id: string, input: UpdateCategoryInput) {
        const category = await this.repository.findById(id);
        if (!category) throw new NotFoundError("Catégorie");

        const data: UpdateCategoryInput & { slug?: string; } = { ...input };

        // Régénère le slug si le nom change
        if (input.name && input.name !== category.name) {
            data.slug = await this.generateUniqueSlug(input.name, id);
        }

        const updated = await this.repository.update(id, data);
        return categoriesMapper.toOutput(updated);
    }

    async remove(id: string) {
        const category = await this.repository.findById(id);
        if (!category) throw new NotFoundError("Catégorie");

        const productCount = await this.repository.countProducts(id);
        if (productCount > 0) {
            throw new ConflictError(
                `Impossible de supprimer : ${productCount} produit(s) sont encore rattachés à cette catégorie.`
            );
        }

        await this.repository.delete(id);
    }

    // ✅ Réordonner en masse (drag & drop côté admin)
    async reorder(input: ReorderCategoriesInput) {
        await this.repository.reorder(input.items);
        return this.list();
    }

    /**
     * Génère un slug unique en suffixant -2, -3... en cas de collision.
     * Évite les erreurs 409 si l'admin veut "Artisanat" alors qu'il existe déjà.
     */
    private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
        const base = toSlug(name);
        let candidate = base;
        let suffix = 2;

        for (; ;) {
            const existing = await this.repository.findBySlug(candidate);
            if (!existing || existing.id === excludeId) return candidate;
            candidate = `${base}-${suffix}`;
            suffix += 1;
        }
    }
}

export const categoriesService = new CategoriesService(categoriesRepository);
