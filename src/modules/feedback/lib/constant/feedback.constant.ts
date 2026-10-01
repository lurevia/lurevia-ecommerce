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
