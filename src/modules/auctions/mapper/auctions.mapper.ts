import { type AuctionProduct, type MessageWithUser } from "../lib/type/auctions.type";
import { timeLeftMs } from "../lib/helper/auctions.helper";

export class AuctionsMapper {
  toAuctionDto(p: AuctionProduct) {
    return {
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
    };
  }

  toMessageDto(m: MessageWithUser) {
    return {
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
    };
  }

}

export const auctionsMapper = new AuctionsMapper();
