import type { Prisma } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// INCLUDE PARTAGÉ
// ─────────────────────────────────────────────────────────────────────────────
export const messageUserSelect = {
  select: { id: true, fullName: true, avatarUrl: true, role: true },
} satisfies Prisma.UserDefaultArgs;
