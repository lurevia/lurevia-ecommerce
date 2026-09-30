import { paymentsRepository } from "./payments.repository";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/AppError";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import {
  generateTransactionReference,
  generateIdempotencyKey,
} from "../../utils/orderNumber";
import {
  OPERATOR_CONFIG,
  isOperatorConfigured,
  callOperatorApi,
  verifyWebhookSignature,
} from "./payments.operators";
import { toTransactionDto, type TransactionWithOrder } from "./payments.mapper";
import type { MobileMoneyProvider, Prisma } from "@prisma/client";
import type {
  InitiatePaymentInput,
  ListTransactionsQuery,
  RefundInput,
  WebhookPayload,
} from "./payments.validators";

export class PaymentsService {
  public async initiate(userId: string, input: InitiatePaymentInput) {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        total: true,
        currency: true,
        status: true,
        paymentMethod: true,
      },
    });
    if (!order) throw new NotFoundError("Commande");
    if (order.userId !== userId) {
      throw new ForbiddenError("Cette commande ne vous appartient pas.");
    }

    if (!["PENDING", "COD_PENDING"].includes(order.status)) {
      throw new ConflictError(
        `Cette commande ne peut plus être payée (statut : ${order.status}).`
      );
    }

    if (!isOperatorConfigured(input.provider)) {
      throw new ConflictError(
        `L'opérateur ${OPERATOR_CONFIG[input.provider].label} n'est pas disponible pour le moment.`
      );
    }
    const existing = await prisma.transaction.findFirst({
      where: {
        orderId: order.id,
        method: "MOBILE_MONEY",
        status: { in: ["INITIATED", "PENDING"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      const full = await paymentsRepository.findById(existing.id);
      return toTransactionDto(full as unknown as TransactionWithOrder);
    }

    const idempotencyKey = generateIdempotencyKey();
    const externalRequestId = generateTransactionReference();

    const transaction = await paymentsRepository.create({
      order: { connect: { id: order.id } },
      amount: order.total,
      currency: order.currency,
      method: "MOBILE_MONEY",
      provider: input.provider,
      status: "INITIATED",
      idempotencyKey,
      externalRequestId,
    });

    try {
      await callOperatorApi({
        provider: input.provider,
        phoneNumber: input.phoneNumber,
        amount: order.total,
        currency: order.currency,
        externalRequestId,
        orderNumber: order.orderNumber,
      });
    } catch (err) {
      logger.error(
        { err, provider: input.provider, orderId: order.id },
        "Échec appel opérateur mobile money"
      );

      await paymentsRepository.updateStatus(transaction.id, {
        status: "FAILED",
        failureReason: "Impossible de joindre l'opérateur.",
        completedAt: new Date(),
      });

      throw new ConflictError(
        `Impossible de joindre ${OPERATOR_CONFIG[input.provider].label}. Réessayez plus tard.`
      );
    }

    logger.info(
      {
        userId,
        orderId: order.id,
        transactionId: transaction.id,
        provider: input.provider,
        amount: order.total,
      },
      "Paiement mobile money initié"
    );

    const full = await paymentsRepository.findById(transaction.id);
    return toTransactionDto(full as unknown as TransactionWithOrder);
  }

  public async getById(userId: string, transactionId: string) {
    const transaction = await paymentsRepository.findById(transactionId);
    if (!transaction) throw new NotFoundError("Transaction");
    if (transaction.order.userId !== userId) {
      throw new ForbiddenError("Cette transaction ne vous appartient pas.");
    }
    return toTransactionDto(transaction as unknown as TransactionWithOrder);
  }

  public async listMine(userId: string, query: ListTransactionsQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [items, totalItems] = await paymentsRepository.findManyByUser(
      userId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit,
      { status: query.status, provider: query.provider }
    );
    return buildPaginatedResult(
      items.map((t) => toTransactionDto(t as unknown as TransactionWithOrder)),
      totalItems,
      pagination
    );
  }

  public async handleWebhook(
    provider: MobileMoneyProvider,
    rawPayload: unknown,
    signatureHeader: string | undefined
  ) {
    const signatureOk = verifyWebhookSignature(
      provider,
      rawPayload,
      signatureHeader
    );

    const payload = rawPayload as WebhookPayload;

    const webhook = await paymentsRepository.createWebhook({
      provider,
      externalId: payload.externalId,
      eventType: payload.status,
      rawPayload: rawPayload as unknown as Prisma.InputJsonValue,
      signature: signatureHeader,
      verified: signatureOk,
    });

    if (!signatureOk) {
      await paymentsRepository.markWebhookProcessed(webhook.id, {
        errorMessage: "Signature invalide.",
      });
      logger.warn(
        { provider, externalId: payload.externalId },
        "Webhook rejeté : signature invalide"
      );
      throw new ForbiddenError("Signature invalide.");
    }

    const transaction = await paymentsRepository.findByExternalId(
      payload.externalId
    );

    if (!transaction) {
      await paymentsRepository.markWebhookProcessed(webhook.id, {
        errorMessage: "Transaction inconnue.",
      });
      logger.warn(
        { provider, externalId: payload.externalId },
        "Webhook : transaction inconnue"
      );
      return { handled: false, reason: "unknown_transaction" };
    }

    if (
      transaction.status === "SUCCESS" ||
      transaction.status === "FAILED"
    ) {
      await paymentsRepository.markWebhookProcessed(webhook.id, {});
      return { handled: true, alreadyProcessed: true };
    }

    await prisma.$transaction(async (tx) => {
      if (payload.status === "SUCCESS") {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "SUCCESS",
            rawCallback: rawPayload as unknown as Prisma.InputJsonValue,
            signatureVerified: true,
            completedAt: new Date(),
          },
        });

        await tx.order.update({
          where: { id: transaction.orderId },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        logger.info(
          { transactionId: transaction.id, orderId: transaction.orderId },
          "Paiement confirmé via webhook"
        );
      } else if (
        payload.status === "FAILED" ||
        payload.status === "CANCELLED"
      ) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: payload.status === "FAILED" ? "FAILED" : "CANCELLED",
            rawCallback: rawPayload as unknown as Prisma.InputJsonValue,
            signatureVerified: true,
            failureReason: payload.message ?? "Échec du paiement",
            completedAt: new Date(),
          },
        });

        await tx.order.update({
          where: { id: transaction.orderId },
          data: { status: "PAYMENT_FAILED" },
        });

        logger.warn(
          {
            transactionId: transaction.id,
            reason: payload.message,
          },
          "Paiement échoué"
        );
      }
    });

    await paymentsRepository.markWebhookProcessed(webhook.id, {});
    return { handled: true, status: payload.status };
  }

  public async refund(transactionId: string, input: RefundInput) {
    const transaction = await paymentsRepository.findById(transactionId);
    if (!transaction) throw new NotFoundError("Transaction");

    if (transaction.status !== "SUCCESS") {
      throw new ConflictError(
        "Seule une transaction réussie peut être remboursée."
      );
    }

    await paymentsRepository.updateStatus(transactionId, {
      status: "REFUNDED",
      failureReason: `Remboursé : ${input.reason}`,
      completedAt: new Date(),
    });

    await prisma.order.update({
      where: { id: transaction.orderId },
      data: { status: "REFUNDED", refundedAt: new Date() },
    });

    logger.info(
      { transactionId, reason: input.reason },
      "Transaction remboursée"
    );

    const updated = await paymentsRepository.findById(transactionId);
    return toTransactionDto(updated as unknown as TransactionWithOrder);
  }
}

export const paymentsService = new PaymentsService();