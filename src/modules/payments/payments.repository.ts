import { prisma } from "../../lib/prisma";
import type {
  Prisma,
  TransactionStatus,
  MobileMoneyProvider,
} from "@prisma/client";

export const paymentsRepository = {
  // ─── Transactions ───
  findById: (id: string) =>
    prisma.transaction.findUnique({
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
    }),

  findByExternalId: (externalId: string) =>
    prisma.transaction.findUnique({
      where: { externalId },
      include: { order: true },
    }),

  findByIdempotencyKey: (idempotencyKey: string) =>
    prisma.transaction.findUnique({
      where: { idempotencyKey },
    }),

  findManyByUser: (
    userId: string,
    skip: number,
    take: number,
    filters?: {
      status?: TransactionStatus;
      provider?: MobileMoneyProvider;
    }
  ) =>
    prisma.$transaction([
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
    ]),

  // ─── Création ───
  create: (data: Prisma.TransactionCreateInput) =>
    prisma.transaction.create({ data }),

  // ─── Mise à jour statut ───
  updateStatus: (
    id: string,
    data: {
      status: TransactionStatus;
      externalId?: string;
      externalRequestId?: string;
      rawCallback?: Prisma.InputJsonValue;
      signatureVerified?: boolean;
      failureReason?: string;
      completedAt?: Date;
    }
  ) =>
    prisma.transaction.update({
      where: { id },
      data,
    }),

  // ─── Webhooks reçus ───
  createWebhook: (data: Prisma.PaymentWebhookCreateInput) =>
    prisma.paymentWebhook.create({ data }),

  findWebhookByExternalId: (externalId: string) =>
    prisma.paymentWebhook.findFirst({
      where: { externalId },
      orderBy: { receivedAt: "desc" },
    }),

  markWebhookProcessed: (
    id: string,
    data: { errorMessage?: string }
  ) =>
    prisma.paymentWebhook.update({
      where: { id },
      data: {
        processedAt: new Date(),
        errorMessage: data.errorMessage,
      },
    }),
};