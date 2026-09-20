import { z } from "zod";
import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate.middleware";
import { ConflictError } from "../../errors/AppError";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const newsletterService = {
  async subscribe(email: string) {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) throw new ConflictError("Cet email est déjà inscrit à la newsletter.");
    return prisma.newsletterSubscriber.create({ data: { email } });
  },
};

const newsletterController = {
  subscribe: asyncHandler(async (req: Request, res: Response) => {
    await newsletterService.subscribe(req.body.email);
    res.status(201).json({ data: { subscribed: true } });
  }),
};

const router = Router();
router.post("/subscribe", validate({ body: subscribeSchema }), newsletterController.subscribe);

export default router;
