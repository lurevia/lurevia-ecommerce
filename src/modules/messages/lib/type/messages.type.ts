import type { UserMessage } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────
export interface MessageRow extends UserMessage {
  sender: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  } | null;
}
