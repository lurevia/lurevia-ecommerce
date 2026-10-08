import type { FeedbackCategory } from "@prisma/client";

export interface FeedbackRow {
  id: string;
  userId: string;
  overallRating: number;
  criteria: unknown;
  category: FeedbackCategory | null;
  comment: string;
  teamResponse: string | null;
  isApproved: boolean;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { fullName: string; avatarUrl: string | null; };
}
