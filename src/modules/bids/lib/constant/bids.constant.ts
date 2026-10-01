import { Prisma } from "@prisma/client";

export const bidUserSelect = {
  select: {
    id: true,
    fullName: true,
    avatarUrl: true,
  },
} satisfies Prisma.UserDefaultArgs;
