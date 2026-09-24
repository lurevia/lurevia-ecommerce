import { BidStatus } from "@prisma/client";
import { bidsRepository } from "./bids.repository";
import { bidsMapper } from "./bids.mapper";
import { CreateBidInput } from "./bids.validators";
import { productsRepository } from "../products/products.repository";
import { ConflictError, NotFoundError } from "../../errors/AppError";

export const bidsService = {
  async placeBid(userId: string, data: CreateBidInput) {
    const { productId, proposedPrice, comment } = data;

    // 1. Vérifier si le produit existe
    const product = await productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(`Produit avec l'ID ${productId} non trouvé`);
    }

    // 2. Empêcher les doublons de bids PENDING pour le même utilisateur et produit
    const existingPendingBid = await bidsRepository.findPendingByUserIdAndProduct(userId, productId);
    if (existingPendingBid) {
      throw new ConflictError("Vous avez déjà une offre en attente pour ce produit");
    }

    // 3. Créer l'offre
    // Correction : Pour Prisma, on utilise 'user' et 'product' (relations)
    const bid = await bidsRepository.create({
      user: { connect: { id: userId } },
      product: { connect: { id: productId } },
      proposedPrice,
      comment,
      status: "PENDING",
    });

    return bidsMapper.toDto(bid);
  },

  async updateBidStatus(bidId: string, status: BidStatus) {
    const bid = await bidsRepository.findById(bidId);
    if (!bid) {
      throw new NotFoundError(`Offre avec l'ID ${bidId} non trouvée`);
    }

    // L'autorisation est gérée par requireRole(['ADMIN', 'SELLER']) dans les routes.
    // On pourrait ajouter ici une vérification pour s'assurer que le SELLER est bien le propriétaire du produit.

    const updatedBid = await bidsRepository.updateStatus(bidId, status);
    return bidsMapper.toDto(updatedBid);
  },

  async getUserBids(userId: string) {
    const bids = await bidsRepository.findByUserId(userId);
    return bids.map(bidsMapper.toDto);
  },

  async getProductBids(productId: string) {
    const bids = await bidsRepository.findByProductId(productId);
    return bids.map(bidsMapper.toDto);
  },
};
