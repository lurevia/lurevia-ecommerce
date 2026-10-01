import type { Prisma } from "@prisma/client";

export const sellerSelect = {
  select: { id: true, fullName: true, email: true },
} satisfies Prisma.UserDefaultArgs;
