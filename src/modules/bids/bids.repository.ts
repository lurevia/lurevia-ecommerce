import { Prisma, BidStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export const bidsRepository = {
  async create(data: Prisma.ProductBidCreateInput) {
    return prisma.productBid.create({
      data,
    });
  },

  async findById(id: string) {
    return prisma.productBid.findUnique({
      where: { id },
      include: {
        product: true,
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },

  async findByProductId(productId: string) {
    return prisma.productBid.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByUserId(userId: string) {
    return prisma.productBid.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            title: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findPendingByUserIdAndProduct(userId: string, productId: string) {
    return prisma.productBid.findFirst({
      where: {
        userId,
        productId,
        status: "PENDING",
      },
    });
  },

  async updateStatus(id: string, status: BidStatus) {
    return prisma.productBid.update({
      where: { id },
      data: { status },
    });
  },
};
