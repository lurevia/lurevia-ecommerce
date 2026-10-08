import type { FeedbackCategory } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { adminRepository, type AdminRepository } from "../repository/admin.repository";
import { productsRepository } from "../../products/repository/products.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import type { ListFeedbackQuery, ListReviewsQuery } from "../dto";
import { adminReviewMapper } from "../mapper/admin-reviews.mapper";

export class AdminModerationService {
    constructor(
        private readonly repository: AdminRepository
    ) { }

    // ─── Avis ───
    async listReviews(query: ListReviewsQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [reviews, totalItems] = await this.repository.findManyReviews({
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit,
            productId: query.productId,
            search: query.search,
            status: query.status,
            rating: query.rating,
        });
        return buildPaginatedResult(adminReviewMapper.toOutputList(reviews as any), totalItems, pagination);
    }

    async removeReview(id: string) {
        const review = await this.repository.findReviewById(id);
        if (!review) throw new NotFoundError("Avis");
        await this.repository.deleteReview(id);
        if (review.productId) {
            await productsRepository.refreshRatingCache(review.productId);
        }
    }

    async approveReview(id: string, adminId: string) {
        const review = await this.repository.findReviewById(id);
        if (!review) throw new NotFoundError("Avis");
        if (review.rejectionReason && !review.isApproved) {
            throw new ConflictError("Cet avis a déjà été rejeté.");
        }
        const updated = await prisma.feedback.update({
            where: { id },
            data: {
                isApproved: true,
                approvedBy: adminId,
                approvedAt: new Date(),
                rejectionReason: null,
            },
            include: {
                user: { select: { fullName: true, email: true, avatarUrl: true } },
                product: { select: { title: true } },
            },
        });
        if (review.productId) {
            await productsRepository.refreshRatingCache(review.productId);
        }
        return adminReviewMapper.toOutput(updated as any);
    }

    async rejectReview(id: string, adminId: string, reason?: string) {
        const review = await this.repository.findReviewById(id);
        if (!review) throw new NotFoundError("Avis");
        const updated = await prisma.feedback.update({
            where: { id },
            data: {
                isApproved: false,
                approvedBy: null,
                approvedAt: null,
                rejectionReason: reason ?? "Avis rejeté",
            },
            include: {
                user: { select: { fullName: true, email: true, avatarUrl: true } },
                product: { select: { title: true } },
            },
        });
        if (review.productId) {
            await productsRepository.refreshRatingCache(review.productId);
        }
        return adminReviewMapper.toOutput(updated as any);
    }

    // ─── Feedback ───
    async listFeedback(query: ListFeedbackQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] = await this.repository.findManyFeedback({
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit,
            category: query.category as FeedbackCategory | undefined,
        });

        const mapped = items.map((item: any) => ({
            id: item.id,
            userId: item.userId,
            userName: item.user?.fullName ?? "",
            userEmail: item.user?.email ?? undefined,
            overallRating: item.rating ?? item.overallRating ?? 0,
            category: item.category,
            comment: item.comment,
            teamResponse: item.officialReply ?? item.teamResponse ?? undefined,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        }));

        return buildPaginatedResult(mapped, totalItems, pagination);
    }

    async respondToFeedback(id: string, teamResponse: string) {
        const feedback = await this.repository.findFeedbackById(id);
        if (!feedback) throw new NotFoundError("Feedback");
        return this.repository.updateFeedbackResponse(id, teamResponse);
    }

    async removeFeedback(id: string) {
        const feedback = await this.repository.findFeedbackById(id);
        if (!feedback) throw new NotFoundError("Feedback");
        await this.repository.deleteFeedback(id);
    }
}

export const adminModerationService = new AdminModerationService(adminRepository);
