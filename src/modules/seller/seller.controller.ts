import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sellerService } from "./seller.service";
export const sellerController = {
  products: asyncHandler(async (req: Request, res: Response) => res.json({ data: { products: await sellerService.listProducts(req.user!.id, Number(req.query.page), Number(req.query.limit)) } })),
  createProduct: asyncHandler(async (req: Request, res: Response) => res.status(201).json({ data: { product: await sellerService.createProduct(req.user!.id, req.body) } })),
  updateProduct: asyncHandler(async (req: Request, res: Response) => res.json({ data: { product: await sellerService.updateProduct(req.user!.id, req.params.id, req.body) } })),
  removeProduct: asyncHandler(async (req: Request, res: Response) => { await sellerService.removeProduct(req.user!.id, req.params.id); res.status(204).send(); }),
  orders: asyncHandler(async (req: Request, res: Response) => res.json({ data: { orders: await sellerService.listOrders(req.user!.id, Number(req.query.page), Number(req.query.limit)) } })),
  order: asyncHandler(async (req: Request, res: Response) => res.json({ data: { order: await sellerService.getOrder(req.user!.id, req.params.id) } })),
  status: asyncHandler(async (req: Request, res: Response) => res.json({ data: { order: await sellerService.updateOrderStatus(req.user!.id, req.params.id, req.body.status) } })),
  feedback: asyncHandler(async (req: Request, res: Response) => res.json({ data: { feedback: await sellerService.feedback(req.user!.id) } })),
  stats: asyncHandler(async (req: Request, res: Response) => res.json({ data: { stats: await sellerService.stats(req.user!.id) } })),
};
