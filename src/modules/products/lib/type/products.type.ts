import { Prisma } from "@prisma/client";
import { productDetailInclude } from "../constant/products.constant";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;
