import type { FeedbackCategory } from "@prisma/client";

export const CATEGORY_TO_DB: Record<string, FeedbackCategory> = {
  delivery: "DELIVERY",
  payment: "PAYMENT",
  support: "SUPPORT",
  website: "WEBSITE",
  other: "OTHER",
};

export const CATEGORY_TO_API: Record<FeedbackCategory, string> = {
  DELIVERY: "delivery",
  PAYMENT: "payment",
  SUPPORT: "support",
  WEBSITE: "website",
  OTHER: "other",
};

export interface FeedbackRow {
  id: string;
  userId: string;
  overallRating: number;
  criteria: unknown;
  category: FeedbackCategory;
  comment: string;
  teamResponse: string | null;
  isApproved: boolean;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { fullName: string; avatarUrl: string | null };
}

export const toFeedbackDto = (feedback: FeedbackRow) => ({
  id: feedback.id,
  userId: feedback.userId,
  userName: feedback.user?.fullName,
  userAvatar: feedback.user?.avatarUrl ?? undefined,
  overallRating: feedback.overallRating,
  criteria: feedback.criteria ?? undefined,
  category: CATEGORY_TO_API[feedback.category],
  comment: feedback.comment,
  teamResponse: feedback.teamResponse ?? undefined,
  isApproved: feedback.isApproved,
  approvedAt: feedback.approvedAt?.toISOString(),
  createdAt: feedback.createdAt.toISOString(),
  updatedAt: feedback.updatedAt.toISOString(),
});
