/**
 * Module categories — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as categoriesRouter } from "./routes/categories.routes";

export { categoriesService } from "./services/categories.service";
export type { CategoriesService } from "./services/categories.service";

export type { CategoryDto } from "./dto";
