export type { CategoryOutput } from "./categories_output.dto";

export {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  categorySlugParamsSchema,
  categoryIdParamsSchema,
} from "../validator/categories.validator";

export type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
} from "../validator/categories.validator";