import { Workbook } from "exceljs";
import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../errors/AppError";
import { buildAddressesSheet, buildProfileSheet } from "./sheets/profile.sheet";
import { buildOrdersSheet } from "./sheets/orders.sheet";
import {
  buildBidsSheet,
  buildFavoritesSheet,
  buildFeedbackSheet,
  buildReviewsSheet,
} from "./sheets/activity.sheet";

const MAX_ORDERS = 5_000;
const MAX_REVIEWS = 5_000;
const MAX_BIDS = 5_000;

export const exportService = {
  /**
   * Génère un classeur Excel contenant TOUTES les données personnelles
   * de l'utilisateur (conformité RGPD article 20 — portabilité).
   */
  async exportUserData(userId: string): Promise<Workbook> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          include: {
            pickupPoint: {
              select: { name: true, provider: true, city: true, phone: true },
            },
          },
        },
        orders: {
          include: { items: true, transactions: true, settlements: true },
          orderBy: { createdAt: "desc" },
          take: MAX_ORDERS,
        },
        reviews: { orderBy: { createdAt: "desc" }, take: MAX_REVIEWS },
        serviceFeedbacks: { orderBy: { createdAt: "desc" } },
        bids: {
          include: { product: { select: { title: true, sku: true } } },
          orderBy: { createdAt: "desc" },
          take: MAX_BIDS,
        },
        favorites: {
          include: { product: { select: { title: true, sku: true } } },
        },
        messagesReceived: {
          orderBy: { createdAt: "desc" },
          take: 500,
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 500,
        },
      },
    });

    if (!user) throw new NotFoundError("Utilisateur");

    const workbook = new Workbook();
    workbook.creator = "Lurevia";
    workbook.created = new Date();

    buildProfileSheet(workbook, user);
    buildAddressesSheet(workbook, user.addresses);
    buildOrdersSheet(workbook, user.orders);
    buildBidsSheet(workbook, user.bids);
    buildReviewsSheet(workbook, user.reviews);
    buildFavoritesSheet(workbook, user.favorites);
    buildFeedbackSheet(workbook, user.serviceFeedbacks);

    return workbook;
  },
};
