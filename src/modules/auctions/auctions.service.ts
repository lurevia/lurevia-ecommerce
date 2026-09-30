import { auctionsRepository } from "./auctions.repository";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import type {
  Product,
  ProductImage,
  AuctionMessageType,
} from "@prisma/client";
import type {
  ListAuctionsQuery,
  ListMessagesQuery,
  PostMessageInput,
} from "./auctions.validators";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const timeLeftMs = (endAt: Date | null) =>
  endAt ? Math.max(0, endAt.getTime() - Date.now()) : 0;

// ─────────────────────────────────────────────────────────────────────────────
// DTO
// ─────────────────────────────────────────────────────────────────────────────

type AuctionProduct = Product & {
  images: ProductImage[];
  _count: { bids: number; auctionWatchers: number };
};

const toAuctionDto = (p: AuctionProduct) => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  imageUrl: p.images[0]?.url ?? null,
  auctionStartPrice: p.auctionStartPrice,
  auctionCurrentPrice: p.auctionCurrentPrice ?? p.auctionStartPrice,
  auctionEndAt: p.auctionEndAt,
  auctionStatus: p.auctionStatus,
  bidCount: p._count.bids,
  watcherCount: p._count.auctionWatchers,
  timeLeftMs: timeLeftMs(p.auctionEndAt),
  hasReserve: p.auctionReservePrice !== null,
});

interface MessageWithUser {
  id: string;
  productId: string;
  userId: string | null;
  type: AuctionMessageType;
  content: string;
  metadata: unknown;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  } | null;
}

const toMessageDto = (m: MessageWithUser) => ({
  id: m.id,
  productId: m.productId,
  userId: m.userId,
  type: m.type,
  content: m.content,
  metadata: m.metadata,
  createdAt: m.createdAt,
  user: m.user
    ? {
        id: m.user.id,
        fullName: m.user.fullName,
        avatarUrl: m.user.avatarUrl,
        role: m.user.role,
      }
    : null,
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class AuctionsService {
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

    const [items, totalItems] = await auctionsRepository.findMany(
      where,
      orderBy,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );

    return buildPaginatedResult(
      items.map((p) => toAuctionDto(p as unknown as AuctionProduct)),
      totalItems,
      pagination
    );
  }

  public async getByProductId(productId: string) {
    const product = await auctionsRepository.findByProductId(productId);
    if (!product || product.pricingMode !== "AUCTION") {
      throw new NotFoundError("Enchère");
    }
    return {
      ...toAuctionDto(product as unknown as AuctionProduct),
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
      await auctionsRepository.getAuctionStats(productId);
    return { bidCount, watcherCount, messageCount };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT
  // ═══════════════════════════════════════════════════════════════════════════

  public async listMessages(productId: string, query: ListMessagesQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [items, totalItems] = await auctionsRepository.findMessages(
      productId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );

    // Les messages sont triés desc pour la pagination, on inverse pour l'affichage
    const sorted = [...items].reverse();

    return buildPaginatedResult(
      sorted.map((m) => toMessageDto(m as unknown as MessageWithUser)),
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
    const product = await auctionsRepository.findByProductId(productId);
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

    const message = await auctionsRepository.createMessage({
      product: { connect: { id: productId } },
      user: { connect: { id: userId } },
      type: "CHAT",
      content: input.content,
    });

    return toMessageDto(message as unknown as MessageWithUser);
  }

  public async deleteMessage(
    productId: string,
    messageId: string,
    userId: string,
    isAdmin: boolean
  ) {
    const message = await auctionsRepository.findMessageById(messageId);
    if (!message || message.productId !== productId) {
      throw new NotFoundError("Message");
    }

    // L'auteur peut supprimer son message, l'admin peut tout supprimer
    if (message.userId !== userId && !isAdmin) {
      throw new ForbiddenError("Vous ne pouvez pas supprimer ce message.");
    }

    await auctionsRepository.softDeleteMessage(messageId, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WATCHERS
  // ═══════════════════════════════════════════════════════════════════════════

  public async watch(productId: string, userId: string) {
    await auctionsRepository.upsertWatcher(productId, userId);
    const count = await auctionsRepository.countActiveWatchers(productId);
    return { watcherCount: count };
  }

  public async unwatch(productId: string, userId: string) {
    await auctionsRepository.deactivateWatcher(productId, userId);
    const count = await auctionsRepository.countActiveWatchers(productId);
    return { watcherCount: count };
  }

  public async getWatcherCount(productId: string) {
    const count = await auctionsRepository.countActiveWatchers(productId);
    return { watcherCount: count };
  }
}

export const auctionsService = new AuctionsService();