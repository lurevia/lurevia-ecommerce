import { type FeedbackRow } from "../lib/type/feedback.type";
import { CATEGORY_TO_API } from "../lib/constant/feedback.constant";

export class FeedbackMapper {
  toOutput(feedback: FeedbackRow) {
    return {
      id: feedback.id,
      userId: feedback.userId,
      userName: feedback.user?.fullName,
      userAvatar: feedback.user?.avatarUrl ?? undefined,
      overallRating: feedback.overallRating,
      criteria: feedback.criteria ?? undefined,
      category: feedback.category ? CATEGORY_TO_API[feedback.category] : undefined,
      comment: feedback.comment,
      teamResponse: feedback.teamResponse ?? undefined,
      isApproved: feedback.isApproved,
      approvedAt: feedback.approvedAt?.toISOString(),
      createdAt: feedback.createdAt.toISOString(),
      updatedAt: feedback.updatedAt.toISOString(),
    };
  }

  toOutputList(items: FeedbackRow[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const feedbackMapper = new FeedbackMapper();
