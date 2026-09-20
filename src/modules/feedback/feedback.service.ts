import type { FeedbackCategory } from "@prisma/client";
import { feedbackRepository } from "./feedback.repository";
import { buildPaginatedResult, normalizePagination } from "../../utils/pagination";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import type { CreateFeedbackInput, UpdateFeedbackInput } from "./feedback.validators";

const CATEGORY_TO_DB: Record<string, FeedbackCategory> = {
  delivery: "DELIVERY",
  payment: "PAYMENT",
  support: "SUPPORT",
  website: "WEBSITE",
  other: "OTHER",
};

const CATEGORY_TO_API: Record<FeedbackCategory, string> = {
  DELIVERY: "delivery",
  PAYMENT: "payment",
  SUPPORT: "support",
  WEBSITE: "website",
  OTHER: "other",
};

const toFeedbackDto = (feedback: {
  id: string;
  userId: string;
  overallRating: number;
  criteria: unknown;
  category: FeedbackCategory;
  comment: string;
  teamResponse: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { fullName: string; avatarUrl: string | null };
}) => ({
  id: feedback.id,
  userId: feedback.userId,
  userName: feedback.user?.fullName,
  userAvatar: feedback.user?.avatarUrl ?? undefined,
  overallRating: feedback.overallRating,
  criteria: feedback.criteria ?? undefined,
  category: CATEGORY_TO_API[feedback.category],
  comment: feedback.comment,
  teamResponse: feedback.teamResponse ?? undefined,
  createdAt: feedback.createdAt.toISOString(),
  updatedAt: feedback.updatedAt.toISOString(),
});

export const feedbackService = {
  async listPublic(page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);
    const [items, totalItems] = await feedbackRepository.findManyPublic(
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );
    return buildPaginatedResult(items.map(toFeedbackDto), totalItems, pagination);
  },

  async listMine(userId: string) {
    const items = await feedbackRepository.findManyByUser(userId);
    return items.map((f) => toFeedbackDto(f));
  },

  async stats() {
    const result = await feedbackRepository.aggregateStats();
    return {
      average: Math.round((result._avg.overallRating ?? 0) * 10) / 10,
      count: result._count,
    };
  },

  async create(userId: string, input: CreateFeedbackInput) {
    const feedback = await feedbackRepository.create({
      user: { connect: { id: userId } },
      overallRating: input.overallRating,
      category: CATEGORY_TO_DB[input.category],
      comment: input.comment,
      criteria: input.criteria,
    });
    return toFeedbackDto(feedback);
  },

  async update(feedbackId: string, userId: string, input: UpdateFeedbackInput) {
    const feedback = await feedbackRepository.findById(feedbackId);
    if (!feedback) throw new NotFoundError("Feedback");
    if (feedback.userId !== userId) throw new ForbiddenError("Ce feedback ne vous appartient pas.");

    const updated = await feedbackRepository.update(feedbackId, {
      overallRating: input.overallRating,
      category: input.category ? CATEGORY_TO_DB[input.category] : undefined,
      comment: input.comment,
      criteria: input.criteria,
    });
    return toFeedbackDto(updated);
  },

  async remove(feedbackId: string, userId: string) {
    const feedback = await feedbackRepository.findById(feedbackId);
    if (!feedback) throw new NotFoundError("Feedback");
    if (feedback.userId !== userId) throw new ForbiddenError("Ce feedback ne vous appartient pas.");
    await feedbackRepository.delete(feedbackId);
  },
};
