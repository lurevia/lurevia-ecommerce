import { prisma } from "../../../lib/prisma";
import type { Prisma, TransactionStatus, MobileMoneyProvider } from "@prisma/client";

export class PaymentsRepository {
    // ─── Transactions ───
    findById(id: string) {
        return prisma.transaction.findUnique({
            where: { id },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        userId: true,
                        total: true,
                        currency: true,
                        status: true,
                    },
                },
            },
        });
    }

    findByExternalId(externalId: string) {
        return prisma.transaction.findUnique({
            where: { externalId },
            include: { order: true },
        });
    }

    findByIdempotencyKey(idempotencyKey: string) {
        return prisma.transaction.findUnique({
            where: { idempotencyKey },
        });
    }

    findManyByUser(userId: string,
        skip: number,
        take: number,
        filters?: {
            status?: TransactionStatus;
            provider?: MobileMoneyProvider;
        }) {
        return prisma.$transaction([
            prisma.transaction.findMany({
                where: {
                    order: { userId },
                    ...(filters?.status ? { status: filters.status } : {}),
                    ...(filters?.provider ? { provider: filters.provider } : {}),
                },
                include: {
                    order: {
                        select: { id: true, orderNumber: true, total: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            prisma.transaction.count({
                where: {
                    order: { userId },
                    ...(filters?.status ? { status: filters.status } : {}),
                    ...(filters?.provider ? { provider: filters.provider } : {}),
                },
            }),
        ]);
    }

    // ─── Création ───
    create(data: Prisma.TransactionCreateInput) {
        return prisma.transaction.create({ data });
    }

    // ─── Mise à jour statut ───
    updateStatus(id: string,
        data: {
            status: TransactionStatus;
            externalId?: string;
            externalRequestId?: string;
            rawCallback?: Prisma.InputJsonValue;
            signatureVerified?: boolean;
            failureReason?: string;
            completedAt?: Date;
        }) {
        return prisma.transaction.update({
            where: { id },
            data,
        });
    }

    // ─── Webhooks reçus ───
    createWebhook(data: Prisma.PaymentWebhookCreateInput) {
        return prisma.paymentWebhook.create({ data });
    }

    findWebhookByExternalId(externalId: string) {
        return prisma.paymentWebhook.findFirst({
            where: { externalId },
            orderBy: { receivedAt: "desc" },
        });
    }

    markWebhookProcessed(id: string,
        data: { errorMessage?: string; }) {
        return prisma.paymentWebhook.update({
            where: { id },
            data: {
                processedAt: new Date(),
                errorMessage: data.errorMessage,
            },
        });
    }
}

export const paymentsRepository = new PaymentsRepository();
