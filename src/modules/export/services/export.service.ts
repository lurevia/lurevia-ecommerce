import { Workbook } from "exceljs";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../errors/AppError";
import { buildAddressesSheet, buildProfileSheet } from "../sheets/profile.sheet";
import { buildOrdersSheet } from "../sheets/orders.sheet";
import { buildBidsSheet, buildFavoritesSheet, buildFeedbackSheet, buildReviewsSheet } from "../sheets/activity.sheet";
import { MAX_ORDERS, MAX_REVIEWS, MAX_BIDS } from "../lib/constant/export.constant";

export class ExportService {
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
                feedbacks: {
                    include: { product: { select: { title: true, sku: true } } },
                    orderBy: { createdAt: "desc" },
                },
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

        const productReviews = (user as any).feedbacks
            ? (user as any).feedbacks.filter((f: any) => f.type === "PRODUCT").map((f: any) => ({
                ...f,
                rejectedAt: f.rejectionReason && !f.isApproved ? f.updatedAt : null,
            }))
            : [];
        const serviceFeedbacks = (user as any).feedbacks
            ? (user as any).feedbacks.filter((f: any) => f.type === "SERVICE").map((f: any) => ({
                ...f,
                overallRating: f.rating,
                teamResponse: f.officialReply ?? null,
            }))
            : [];

        buildProfileSheet(workbook, user as any);
        buildAddressesSheet(workbook, (user as any).addresses ?? []);
        buildOrdersSheet(workbook, (user as any).orders ?? []);
        buildBidsSheet(workbook, (user as any).bids ?? []);
        buildReviewsSheet(workbook, productReviews);
        buildFavoritesSheet(workbook, (user as any).favorites ?? []);
        buildFeedbackSheet(workbook, serviceFeedbacks);

        return workbook;
    }
}

export const exportService = new ExportService();
