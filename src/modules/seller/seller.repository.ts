import { prisma } from "../../lib/prisma";
import { productDetailInclude } from "../products/products.repository";
export const sellerRepository = {
  products: (ownerId: string, skip: number, take: number) => prisma.$transaction([
    prisma.product.findMany({ where: { ownerId }, include: productDetailInclude, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.product.count({ where: { ownerId } }),
  ]),
  orders: (ownerId: string, skip: number, take: number) => prisma.$transaction([
    prisma.order.findMany({ where: { items: { some: { product: { ownerId } } } }, include: { items: true, user: { select: { id: true, fullName: true, email: true } } }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.order.count({ where: { items: { some: { product: { ownerId } } } } }),
  ]),
  order: (ownerId: string, id: string) => prisma.order.findFirst({ where: { id, items: { some: { product: { ownerId } } } }, include: { items: { include: { product: { select: { ownerId: true } } } }, user: { select: { id: true, fullName: true, email: true } } } }),
  feedback: (ownerId: string) => prisma.serviceFeedback.findMany({
    where: { OR: [{ product: { ownerId } }, { order: { items: { some: { product: { ownerId } } } } }] },
    include: { user: { select: { id: true, fullName: true, avatarUrl: true } }, product: { select: { id: true, title: true } }, order: { select: { id: true, orderNumber: true } } },
    orderBy: { createdAt: "desc" },
  }),
  stats: async (ownerId: string) => {
    const [products, grouped, feedback, reviews] = await Promise.all([
      prisma.product.count({ where: { ownerId } }),
      prisma.orderItem.findMany({ where: { product: { ownerId }, order: { status: { not: "CANCELLED" } } }, select: { quantity: true, priceSnapshot: true } }),
      prisma.serviceFeedback.aggregate({ where: { OR: [{ product: { ownerId } }, { order: { items: { some: { product: { ownerId } } } } }] }, _avg: { overallRating: true }, _count: true }),
      prisma.productReview.aggregate({ where: { product: { ownerId } }, _avg: { rating: true }, _count: true }),
    ]);
    return { products, sales: grouped.reduce((sum, item) => sum + item.quantity, 0), revenue: grouped.reduce((sum, item) => sum + item.quantity * item.priceSnapshot, 0), feedbackCount: feedback._count, feedbackAverage: feedback._avg.overallRating ?? 0, reviewCount: reviews._count, reviewAverage: reviews._avg.rating ?? 0 };
  },
};
