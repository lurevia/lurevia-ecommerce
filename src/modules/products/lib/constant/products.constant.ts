import { Prisma } from "@prisma/client";

export const productDetailInclude = {
  images: { orderBy: { position: "asc" } },
  colors: true,
  sizes: true,
  categories: { include: { category: true } },
  boutique: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      ownerId: true,
      owner: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  },
  tags: { include: { tag: true } },
} satisfies Prisma.ProductInclude;
