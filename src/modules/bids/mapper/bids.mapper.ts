import { type BidWithRelations } from "../lib/type/bids.type";
import { type BidDto } from "../dto/bids_output.dto";

// ─────────────────────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────────────────────

export class BidsMapper {
  toOutput(bid: BidWithRelations): BidDto {
    return {
      id: bid.id,
      productId: bid.productId,
      proposedPrice: bid.proposedPrice,
      comment: bid.comment,
      status: bid.status,
      isAutoBid: bid.isAutoBid,
      autoBidMax: bid.autoBidMax,
      isWinningBid: bid.isWinningBid,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      user: {
        id: bid.user.id,
        fullName: bid.user.fullName,
        avatarUrl: bid.user.avatarUrl,
      },
      product: bid.product,
    };
  }

  toOutputList(bids: BidWithRelations[]): BidDto[] {
    return bids.map((bid) => this.toOutput(bid));
  }
}

export const bidsMapper = new BidsMapper();
