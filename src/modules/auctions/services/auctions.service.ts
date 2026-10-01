import { auctionsRepository, type AuctionsRepository } from "../repository/auctions.repository";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import type { ListAuctionsQuery, ListMessagesQuery, PostMessageInput } from "../dto";
import { auctionsMapper } from "../mapper/auctions.mapper";
import { type AuctionProduct, type MessageWithUser } from "../lib/type/auctions.type";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class AuctionsService {
    constructor(private readonly repository: AuctionsRepository) { }

    // ═══════════════════════════════════════════════════════════════════════════
    // LISTE & DÉTAIL
    // ═══════════════════════════════════════════════════════════════════════════

    public async list(query: ListAuctionsQuery) {
        const pagination = normalizePagination(query.page, query.limit);

        const where = {
            pricingMode: "AUCTION" as const,
            isActive: true,
            ...(query.status ? { auctionStatus: query.status } : {}),
            ...(query.search
                ? { title: { contains: query.search, mode: "insensitive" as const } }
                : {}),
        };

        const orderBy =
            query.sortBy === "ending-soon"
                ? { auctionEndAt: "asc" as const }
                : query.sortBy === "newest"
                    ? { createdAt: "desc" as const }
                    : query.sortBy === "price-desc"
                        ? { auctionCurrentPrice: "desc" as const }
                        : { auctionBidCount: "desc" as const };

        const [items, totalItems] = await this.repository.findMany(
            where,
            orderBy,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );

        return buildPaginatedResult(
            items.map((p) => auctionsMapper.toAuctionDto(p as unknown as AuctionProduct)),
            totalItems,
            pagination
        );
    }

    public async getByProductId(productId: string) {
        const product = await this.repository.findByProductId(productId);
        if (!product || product.pricingMode !== "AUCTION") {
            throw new NotFoundError("Enchère");
        }
        return {
            ...auctionsMapper.toAuctionDto(product as unknown as AuctionProduct),
            description: product.description,
            images: product.images.map((i) => i.url),
            owner: product.owner,
            hasReserve: product.auctionReservePrice !== null,
            reserveMet:
                product.auctionReservePrice !== null &&
                (product.auctionCurrentPrice ?? 0) >= product.auctionReservePrice,
        };
    }

    public async getStats(productId: string) {
        const [bidCount, watcherCount, messageCount] =
            await this.repository.getAuctionStats(productId);
        return { bidCount, watcherCount, messageCount };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CHAT
    // ═══════════════════════════════════════════════════════════════════════════

    public async listMessages(productId: string, query: ListMessagesQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] = await this.repository.findMessages(
            productId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );

        // Les messages sont triés desc pour la pagination, on inverse pour l'affichage
        const sorted = [...items].reverse();

        return buildPaginatedResult(
            sorted.map((m) => auctionsMapper.toMessageDto(m as unknown as MessageWithUser)),
            totalItems,
            pagination
        );
    }

    public async postMessage(
        productId: string,
        userId: string,
        input: PostMessageInput
    ) {
        // Vérifie que le produit existe et est en enchère
        const product = await this.repository.findByProductId(productId);
        if (!product || product.pricingMode !== "AUCTION") {
            throw new NotFoundError("Enchère");
        }

        // Chat fermé si l'enchère est terminée
        if (
            product.auctionStatus === "ENDED" ||
            product.auctionStatus === "SOLD" ||
            product.auctionStatus === "CANCELLED" ||
            product.auctionStatus === "UNSOLD"
        ) {
            throw new ConflictError("Cette enchère est terminée.");
        }

        const message = await this.repository.createMessage({
            product: { connect: { id: productId } },
            user: { connect: { id: userId } },
            type: "CHAT",
            content: input.content,
        });

        return auctionsMapper.toMessageDto(message as unknown as MessageWithUser);
    }

    public async deleteMessage(
        productId: string,
        messageId: string,
        userId: string,
        isAdmin: boolean
    ) {
        const message = await this.repository.findMessageById(messageId);
        if (!message || message.productId !== productId) {
            throw new NotFoundError("Message");
        }

        // L'auteur peut supprimer son message, l'admin peut tout supprimer
        if (message.userId !== userId && !isAdmin) {
            throw new ForbiddenError("Vous ne pouvez pas supprimer ce message.");
        }

        await this.repository.softDeleteMessage(messageId, userId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WATCHERS
    // ═══════════════════════════════════════════════════════════════════════════

    public async watch(productId: string, userId: string) {
        await this.repository.upsertWatcher(productId, userId);
        const count = await this.repository.countActiveWatchers(productId);
        return { watcherCount: count };
    }

    public async unwatch(productId: string, userId: string) {
        await this.repository.deactivateWatcher(productId, userId);
        const count = await this.repository.countActiveWatchers(productId);
        return { watcherCount: count };
    }

    public async getWatcherCount(productId: string) {
        const count = await this.repository.countActiveWatchers(productId);
        return { watcherCount: count };
    }
}

export const auctionsService = new AuctionsService(auctionsRepository);
