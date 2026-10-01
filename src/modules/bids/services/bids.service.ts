import { BidStatus } from "@prisma/client";
import { bidsRepository, type BidsRepository } from "../repository/bids.repository";
import { bidsMapper } from "../mapper/bids.mapper";
import { productsRepository } from "../../products/repository/products.repository";
import { prisma } from "../../../lib/prisma";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { isValidBid, shouldExtendAuction } from "../../../utils/auction";
import { logger } from "../../../lib/logger";
import type { CreateBidInput, ListProductBidsQuery } from "../dto";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { type BidWithRelations } from "../lib/type/bids.type";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class BidsService {
    constructor(private readonly repository: BidsRepository) { }

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
        const existing = await this.repository.findPendingByUserIdAndProduct(userId, productId);
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
                bid: bidsMapper.toOutput(result.bid as unknown as BidWithRelations),
                auctionEndAt: result.product.auctionEndAt,
                extended: result.extended,
            };
        }

        // ═════════════════════════════════════════════════════════════════════════
        // CAS NEGOTIABLE — simple proposition
        // ═════════════════════════════════════════════════════════════════════════
        const bid = await this.repository.create({
            user: { connect: { id: userId } },
            product: { connect: { id: productId } },
            proposedPrice,
            comment,
            status: "PENDING",
        });

        return { bid: bidsMapper.toOutput(bid as unknown as BidWithRelations) };
    }

    /**
     * Vendeur/admin accepte ou refuse une offre (mode NEGOTIABLE).
     */
    public async updateBidStatus(bidId: string, status: BidStatus, actorId: string) {
        const bid = await this.repository.findById(bidId);
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

        const updated = await this.repository.updateStatus(bidId, status);
        return bidsMapper.toOutput(updated as unknown as BidWithRelations);
    }

    public async getUserBids(userId: string) {
        const bids = await this.repository.findByUserId(userId);
        return bids.map((b) => bidsMapper.toOutput(b as unknown as BidWithRelations));
    }

    public async getProductBids(productId: string, query: ListProductBidsQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] = await this.repository.findByProductId(
            productId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit
        );
        return buildPaginatedResult(
            items.map((b) => bidsMapper.toOutput(b as unknown as BidWithRelations)),
            totalItems,
            pagination
        );
    }
}

export const bidsService = new BidsService(bidsRepository);
