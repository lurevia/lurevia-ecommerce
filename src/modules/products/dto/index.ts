export type {
  ProductDto,
} from "./products_output.dto";

export {
  listProductsQuerySchema,
  productIdParamsSchema,
  productSlugParamsSchema,
  searchSuggestionsQuerySchema,
  createProductSchema,
  updateProductSchema,
} from "../validator/products.validator";

export type {
  ListProductsQuery,
  CreateProductInput,
  UpdateProductInput,
  SearchSuggestionsQuery,
} from "../validator/products.validator";
