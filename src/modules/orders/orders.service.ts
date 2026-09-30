import { ordersRepository } from "./orders.repository";
import { cartRepository } from "../cart/cart.repository";
import { addressesRepository } from "../addresses/addresses.repository";
import { shippingZonesService } from "../shipping-zones/shipping-zones.service";
import {
  toOrderDto,
  type OrderWithRelations,
  ORDER_STATUS_FROM_API,
  PAYMENT_METHOD_FROM_API,
} from "./orders.mapper";
import {
  buildPaginatedResult,
  normalizePagination,
} from "../../utils/pagination";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { generateOrderNumber } from "../../utils/orderNumber";
import { notificationsService } from "../notifications/notifications.service";
import { logger } from "../../lib/logger";
import type { CheckoutInput } from "./orders.validators";
import type { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const assertOwnership = async (orderId: string, userId: string) => {
  const order = await ordersRepository.findById(orderId);
  if (!order) throw new NotFoundError("Commande");
  if (order.userId !== userId) {
    throw new ForbiddenError("Cette commande ne vous appartient pas.");
  }
  return order;
};

/**
 * Calcule les frais de livraison.
 *
 * Ordre de calcul :
 *   1. Seuil de gratuité atteint → 0 Ar
 *   2. Zone exacte par région → tarif de la zone
 *   3. Fallback zone par province
 *   4. Fallback frais par défaut (settings)
 */
async function computeShippingCost(params: {
  province: ProvinceMadagascar;
  region: RegionMadagascar;
  subtotal: number;
  deliveryMode: "HOME_DELIVERY" | "PICKUP_POINT";
}): Promise<{ cost: number; zoneId?: string }> {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
  });

  // 1. Seuil de gratuité
  const freeThreshold = settings?.freeShippingThreshold ?? 250_000;
  if (params.subtotal >= freeThreshold) {
    return { cost: 0 };
  }

  // 2. & 3. Cherche la zone (région exacte → province → rien)
  const { cost, zoneId } = await shippingZonesService.findForRegion(
    params.region,
    params.province
  );

  if (cost > 0 && zoneId) {
    return { cost, zoneId };
  }

  // 4. Fallback : frais par défaut
  return { cost: settings?.defaultShippingCost ?? 8_000 };
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class OrdersService {
  public async checkout(userId: string, input: CheckoutInput) {
    const cartItems = await cartRepository.findByUser(userId);
    if (cartItems.length === 0) {
      throw new BadRequestError("Votre panier est vide.");
    }

    // ─── 1. Résolution de l'adresse de livraison (snapshot) ───
    let shipping: {
      shippingFullName: string;
      shippingPhone: string;
      shippingEmail: string;
      shippingProvince: ProvinceMadagascar;
      shippingRegion: RegionMadagascar;
      shippingCity: string;
      shippingNeighborhood?: string;
      shippingAddress: string;
      shippingNotes?: string;
    };

    if (input.addressId) {
      const address = await addressesRepository.findById(input.addressId);
      if (!address || address.userId !== userId) {
        throw new NotFoundError("Adresse");
      }
      shipping = {
        shippingFullName: address.fullName,
        shippingPhone: address.phone,
        shippingEmail: address.email ?? "",
        shippingProvince: address.province,
        shippingRegion: address.region,
        shippingCity: address.city,
        shippingNeighborhood: address.neighborhood ?? undefined,
        shippingAddress: address.address,
        shippingNotes: address.notes ?? undefined,
      };
    } else {
      shipping = {
        shippingFullName: input.shipping!.fullName,
        shippingPhone: input.shipping!.phone,
        shippingEmail: input.shipping!.email,
        shippingProvince: input.shipping!.province,
        shippingRegion: input.shipping!.region,
        shippingCity: input.shipping!.city,
        shippingNeighborhood: input.shipping!.neighborhood,
        shippingAddress: input.shipping!.address,
        shippingNotes: input.shipping!.notes,
      };
    }

    // ─── 2. Calcul des totaux côté serveur ───
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.quantity * (item.product.price ?? 0),
      0
    );

    const { cost: shippingCost, zoneId } = await computeShippingCost({
      province: shipping.shippingProvince,
      region: shipping.shippingRegion,
      subtotal,
      deliveryMode: input.deliveryMode,
    });

    const total = subtotal + shippingCost;

    // ─── 3. Validation du point relais si PICKUP_POINT ───
    if (input.deliveryMode === "PICKUP_POINT" && input.pickupPointId) {
      const pickup = await prisma.pickupPoint.findUnique({
        where: { id: input.pickupPointId },
        select: { id: true, isActive: true },
      });
      if (!pickup || !pickup.isActive) {
        throw new NotFoundError("Point relais");
      }
    }

    // ─── 4. Statut initial selon mode de paiement ───
    const paymentMethod = PAYMENT_METHOD_FROM_API[input.paymentMethod];
    if (!paymentMethod) {
      throw new BadRequestError("Méthode de paiement invalide.");
    }

    const isCOD = input.paymentMethod === "cash";
    const initialStatus = isCOD ? "COD_PENDING" : "PAID";
    const transactionStatus = isCOD ? "PENDING" : "SUCCESS";

    // ─── 5. Création de la commande ───
    try {
      const order = await ordersRepository.createOrderTransactional({
        userId,
        orderNumber: generateOrderNumber(),
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceSnapshot: item.product.price ?? 0,
          titleSnapshot: item.product.title,
          imageSnapshot: item.product.images[0]?.url ?? null,
          skuSnapshot: item.product.sku,
          colorSnapshot: item.color?.label ?? null,
          sizeSnapshot: item.size?.value ?? null,
        })),
        shipping,
        deliveryMode: input.deliveryMode,
        shippingZoneId: zoneId,
        shippingPickupPointId: input.pickupPointId,
        deliveryLatitude: input.deliveryLatitude,
        deliveryLongitude: input.deliveryLongitude,
        deliveryAccuracy: input.deliveryAccuracy,
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        initialStatus,
        transactionStatus,
        codAmountExpected: isCOD ? total : undefined,
      });

      logger.info(
        { userId, orderId: order.id, total },
        "Commande créée"
      );

      return toOrderDto(order as unknown as OrderWithRelations);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.startsWith("STOCK_INSUFFICIENT:")
      ) {
        const productId = err.message.split(":")[1];
        throw new ConflictError(
          "Le stock de certains articles a changé entre-temps.",
          { productId }
        );
      }
      throw err;
    }
  }

  public async list(userId: string, page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);
    const [orders, totalItems] = await ordersRepository.findManyByUser(
      userId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );
    return buildPaginatedResult(orders.map(toOrderDto), totalItems, pagination);
  }

  public async getById(userId: string, orderId: string) {
    const order = await assertOwnership(orderId, userId);
    return toOrderDto(order as unknown as OrderWithRelations);
  }

  public async cancel(userId: string, orderId: string) {
    const order = await assertOwnership(orderId, userId);

    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      throw new ConflictError(
        "Une commande déjà expédiée ou livrée ne peut plus être annulée."
      );
    }
    if (order.status === "CANCELLED") {
      throw new ConflictError("Cette commande est déjà annulée.");
    }

    await ordersRepository.restoreStock(orderId);
    const updated = await ordersRepository.updateStatus(orderId, "CANCELLED");
    return toOrderDto(updated as unknown as OrderWithRelations);
  }

  public async adminUpdateStatus(orderId: string, statusApi: string) {
    const order = await ordersRepository.findById(orderId);
    if (!order) throw new NotFoundError("Commande");

    const statusKey = statusApi.toLowerCase().replaceAll("_", "-");
    const nextStatus =
      ORDER_STATUS_FROM_API[statusApi] ?? ORDER_STATUS_FROM_API[statusKey];
    if (!nextStatus) {
      throw new BadRequestError("Statut de commande invalide.");
    }

    // Timestamp automatique selon le statut
    const extra: Record<string, Date> = {};
    if (nextStatus === "PAID") extra.paidAt = new Date();
    if (nextStatus === "SHIPPED") extra.shippedAt = new Date();
    if (nextStatus === "DELIVERED") extra.deliveredAt = new Date();
    if (nextStatus === "CANCELLED") extra.cancelledAt = new Date();
    if (nextStatus === "REFUNDED") extra.refundedAt = new Date();

    const updated = await ordersRepository.updateStatus(
      orderId,
      nextStatus,
      extra
    );

    // Notifications transactionnelles
    if (nextStatus === "SHIPPED") {
      await notificationsService
        .notifyOrderShipped(updated as unknown as OrderWithRelations)
        .catch((err) =>
          logger.error(
            { err, orderId },
            "Échec notification d'expédition"
          )
        );
    }
    if (nextStatus === "DELIVERED") {
      await notificationsService
        .notifyOrderDelivered(updated as unknown as OrderWithRelations)
        .catch((err) =>
          logger.error({ err, orderId }, "Échec notification de livraison")
        );
    }

    return toOrderDto(updated as unknown as OrderWithRelations);
  }
}

export const ordersService = new OrdersService();