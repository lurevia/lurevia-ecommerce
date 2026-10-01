import type { Prisma } from "@prisma/client";

export const messageInclude = {
  sender: {
    select: { id: true, fullName: true, avatarUrl: true, role: true },
  },
} satisfies Prisma.UserMessageInclude;
