import { BidStatus } from "@prisma/client";
import { bidsRepository } from "./bids.repository";
import { bidsMapper, type BidWithRelations } from "./bids.mapper";
import { productsRepository } from "../products/products.repository";
import { prisma } from "../../lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/AppError";
import {
  isValidBid,
  shouldExtendAuction,
} from "../../utils/auction";
import { logger } from "../../lib/logger";
import type { CreateBidInput, ListProductBidsQuery } from "./bids.validators";
import { buildPaginatedResult, normalizePagination } from "../../utils/pagination";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class BidsService {
  /**
   * Place une offre. Deux cas :
   *  - NEGOTIABLE : le client propose, statut PENDING
   *  - AUCTION   : règles strictes (incrément, anti-snipe, réserve, OUTBID)
   */
  public async placeBid(userId: string, data: CreateBidInput) {
    const { productId, proposedPrice, comment, isAutoBid, autoBidMax } = data;

    // 1. Récupère le produit
    const product = await productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Produit");
    }

    // 2. Le produit doit être actif
    if (!product.isActive) {
      throw new ConflictError("Ce produit n'est plus disponible.");
    }

    // 3. Le vendeur ne peut pas enchérir sur son propre produit
    if (product.ownerId === userId) {
      throw new ForbiddenError("Vous ne pouvez pas enchérir sur votre propre produit.");
    }

    // 4. Le mode de vente doit accepter les offres
    if (product.pricingMode === "FIXED" || product.pricingMode === "ON_REQUEST") {
      throw new ConflictError("Ce produit n'accepte pas d'offres.");
    }

    // 5. Pas de doublon PENDING pour le même produit
    const existing = await bidsRepository.findPendingByUserIdAndProduct(userId, productId);
    if (existing) {
      throw new ConflictError("Vous avez déjà une offre en attente pour ce produit.");
    }

    // ═════════════════════════════════════════════════════════════════════════
    // CAS AUCTION — règles strictes
    // ═════════════════════════════════════════════════════════════════════════
    if (product.pricingMode === "AUCTION") {
      // L'enchère doit être ACTIVE et non terminée
      if (product.auctionStatus !== "ACTIVE") {
        throw new ConflictError("Cette enchère n'est plus active.");
      }
      if (product.auctionEndAt && product.auctionEndAt < new Date()) {
        throw new ConflictError("Cette enchère est terminée.");
      }
      if (!product.auctionStartPrice) {
        throw new ConflictError("Cette enchère est mal configurée.");
      }

      // Vérifie l'incrément minimum
      const validation = isValidBid({
        proposedPrice,
        currentPrice: product.auctionCurrentPrice ?? null,
        startPrice: product.auctionStartPrice,
      });
      if (!validation.valid) {
        throw new ConflictError(validation.reason);
      }

      // Crée l'offre en transaction : création + déchéance de l'ancien gagnant + anti-snipe
      const result = await prisma.$transaction(async (tx) => {
        // Déchoit l'ancienne offre gagnante
        await tx.productBid.updateMany({
          where: { productId, isWinningBid: true },
          data: { isWinningBid: false, status: "OUTBID" },
        });

        // Crée la nouvelle offre
        const bid = await tx.productBid.create({
          data: {
            proposedPrice,
            comment,
            status: "WINNING",
            isWinningBid: true,
            isAutoBid: isAutoBid ?? false,
            autoBidMax: isAutoBid ? autoBidMax : null,
            user: { connect: { id: userId } },
            product: { connect: { id: productId } },
          },
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        });

        // Anti-snipe : si l'offre arrive dans les 2 dernières minutes, on prolonge
        const extension = shouldExtendAuction(product.auctionEndAt!);

        // Met à jour le produit
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            auctionCurrentPrice: proposedPrice,
            auctionBidCount: { increment: 1 },
            ...(extension.extend && { auctionEndAt: extension.newEndAt }),
          },
        });

        return { bid, product: updatedProduct, extended: extension.extend };
      });

      logger.info(
        {
          userId,
          productId,
          amount: proposedPrice,
          extended: result.extended,
        },
        "Nouvelle offre d'enchère"
      );

      return {
        bid: bidsMapper.toDto(result.bid as unknown as BidWithRelations),
        auctionEndAt: result.product.auctionEndAt,
        extended: result.extended,
      };
    }

    // ═════════════════════════════════════════════════════════════════════════
    // CAS NEGOTIABLE — simple proposition
    // ═════════════════════════════════════════════════════════════════════════
    const bid = await bidsRepository.create({
      user: { connect: { id: userId } },
      product: { connect: { id: productId } },
      proposedPrice,
      comment,
      status: "PENDING",
    });

    return { bid: bidsMapper.toDto(bid as unknown as BidWithRelations) };
  }

  /**
   * Vendeur/admin accepte ou refuse une offre (mode NEGOTIABLE).
   */
  public async updateBidStatus(bidId: string, status: BidStatus, actorId: string) {
    const bid = await bidsRepository.findById(bidId);
    if (!bid) throw new NotFoundError("Offre");

    // Vérifie que l'actor est le vendeur du produit OU un admin
    const isOwner = bid.product.ownerId === actorId;
    const isAdmin = await prisma.user
      .findUnique({ where: { id: actorId }, select: { role: true } })
      .then((u) => u?.role === "ADMIN");

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Vous n'êtes pas autorisé à modifier cette offre.");
    }

    // On ne peut accepter/refuser qu'une offre PENDING
    if (bid.status !== "PENDING" && bid.status !== "WINNING") {
      throw new ConflictError("Cette offre a déjà été traitée.");
    }

    const updated = await bidsRepository.updateStatus(bidId, status);
    return bidsMapper.toDto(updated as unknown as BidWithRelations);
  }

  public async getUserBids(userId: string) {
    const bids = await bidsRepository.findByUserId(userId);
    return bids.map((b) => bidsMapper.toDto(b as unknown as BidWithRelations));
  }

  public async getProductBids(productId: string, query: ListProductBidsQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [items, totalItems] = await bidsRepository.findByProductId(
      productId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );
    return buildPaginatedResult(
      items.map((b) => bidsMapper.toDto(b as unknown as BidWithRelations)),
      totalItems,
      pagination
    );
  }
}

export const bidsService = new BidsService();