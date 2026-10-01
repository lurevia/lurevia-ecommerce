import { Prisma } from "@prisma/client";

export const productDetailInclude = {
  images: { orderBy: { position: "asc" } },
  colors: true,
  sizes: true,
  categories: { include: { category: true } },
} satisfies Prisma.ProductInclude;
