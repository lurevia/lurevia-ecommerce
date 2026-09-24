import { Request, Response } from "express";
import { bidsService } from "./bids.service";

export const bidsController = {
  async createBid(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Utilisateur non authentifié" });
      return;
    }

    const result = await bidsService.placeBid(userId, req.body);
    res.status(201).json({ data: result });
  },

  async getMyBids(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Utilisateur non authentifié" });
      return;
    }

    const result = await bidsService.getUserBids(userId);
    res.status(200).json({ data: result });
  },

  async getProductBids(req: Request, res: Response) {
    const { productId } = req.params;
    const result = await bidsService.getProductBids(productId);
    res.status(200).json({ data: result });
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const result = await bidsService.updateBidStatus(id, status);
    res.status(200).json({ data: result });
  },
};
