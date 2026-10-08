import { feedbackRepository, type FeedbackRepository } from "../repository/feedback.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { ForbiddenError, NotFoundError } from "../../../errors/AppError";
import type { CreateFeedbackInput, UpdateFeedbackInput } from "../dto";
import { CATEGORY_TO_DB } from "../lib/constant/feedback.constant";
import { feedbackMapper } from "../mapper/feedback.mapper";

export class FeedbackService {
    constructor(
        private readonly repository: FeedbackRepository
    ) { }

    async listPublic(page?: number, limit?: number) {
        const pagination = normalizePagination(page, limit);
        const [items, totalItems] = await this.repository.findManyPublic(
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );
        return buildPaginatedResult(
            feedbackMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    async listMine(userId: string, page?: number, limit?: number) {
        const pagination = normalizePagination(page, limit);
        const [items, totalItems] = await this.repository.findManyByUser(
            userId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );
        return buildPaginatedResult(
            feedbackMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    async stats() {
        const result = await this.repository.aggregateStats();
        return {
            average: Math.round(((result._avg as any).rating ?? (result._avg as any).overallRating ?? 0) * 10) / 10,
            count: result._count,
        };
    }

    async create(userId: string, input: CreateFeedbackInput) {
        const { orderId, productId } = input;

        if (orderId) {
            const order = await this.repository.findOrderForUser(orderId, userId);
            if (!order) {
                throw new ForbiddenError("Cette commande ne vous appartient pas.");
            }
            if (productId && !order.items.some((i) => i.productId === productId)) {
                throw new ForbiddenError("Le produit n'appartient pas à cette commande.");
            }
        }

        if (productId && !orderId) {
            const purchase = await this.repository.findPurchasedProduct(productId, userId);
            if (!purchase) {
                throw new ForbiddenError("Vous ne pouvez pas rattacher ce produit à votre feedback.");
            }
        }

        const feedback = await this.repository.create({
            user: { connect: { id: userId } },
            overallRating: input.overallRating,
            category: CATEGORY_TO_DB[input.category],
            comment: input.comment,
            criteria: input.criteria,
            ...(orderId ? { order: { connect: { id: orderId } } } : {}),
            ...(productId ? { product: { connect: { id: productId } } } : {}),
        });

        return feedbackMapper.toOutput(feedback);
    }

    async update(feedbackId: string, userId: string, input: UpdateFeedbackInput) {
        const feedback = await this.repository.findById(feedbackId);
        if (!feedback) throw new NotFoundError("Feedback");
        if (feedback.userId !== userId) {
            throw new ForbiddenError("Ce feedback ne vous appartient pas.");
        }

        if (feedback.isApproved) {
            throw new ForbiddenError(
                "Un feedback approuvé ne peut plus être modifié. Contactez le support."
            );
        }

        const updated = await this.repository.update(feedbackId, {
            overallRating: input.overallRating,
            category: input.category ? CATEGORY_TO_DB[input.category] : undefined,
            comment: input.comment,
            criteria: input.criteria,
        });

        return feedbackMapper.toOutput(updated);
    }

    async remove(feedbackId: string, userId: string) {
        const feedback = await this.repository.findById(feedbackId);
        if (!feedback) throw new NotFoundError("Feedback");
        if (feedback.userId !== userId) {
            throw new ForbiddenError("Ce feedback ne vous appartient pas.");
        }
        await this.repository.delete(feedbackId);
    }
}

export const feedbackService = new FeedbackService(feedbackRepository);
