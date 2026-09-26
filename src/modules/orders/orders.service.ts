import { ordersRepository } from "./orders.repository";
import { cartRepository } from "../cart/cart.repository";
import { addressesRepository } from "../addresses/addresses.repository";
import { toOrderDto, ORDER_STATUS_FROM_API, PAYMENT_METHOD_FROM_API } from "./orders.mapper";
import { buildPaginatedResult, normalizePagination } from "../../utils/pagination";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../errors/AppError";
import { env } from "../../config/env";
import { notificationsService } from "../notifications/notifications.service";
import type { CheckoutInput } from "./orders.validators";
import { logger } from "../../lib/logger";

const assertOwnership = async (orderId: string, userId: string) => {
  const order = await ordersRepository.findById(orderId);
  if (!order) throw new NotFoundError("Commande");
  if (order.userId !== userId) throw new ForbiddenError("Cette commande ne vous appartient pas.");
  return order;
};

export const ordersService = {
  async checkout(userId: string, input: CheckoutInput) {
    const cartItems = await cartRepository.findByUser(userId);
    if (cartItems.length === 0) {
      throw new BadRequestError("Votre panier est vide.");
    }

    // ── Résolution de l'adresse de livraison ──
    let shipping: {
      shippingFullName: string;
      shippingPhone: string;
      shippingEmail: string;
      shippingAddress: string;
      shippingCity: string;
      shippingRegion: string;
      shippingNotes?: string;
    };

    if (input.addressId) {
      const address = await addressesRepository.findById(input.addressId);
      if (!address || address.userId !== userId) throw new NotFoundError("Adresse");
      shipping = {
        shippingFullName: address.fullName,
        shippingPhone: address.phone,
        shippingEmail: address.email || "",
        shippingAddress: address.address,
        shippingCity: address.city,
        shippingRegion: address.region,
        shippingNotes: address.notes ?? undefined,
      };
    } else {
      shipping = {
        shippingFullName: input.shipping!.fullName,
        shippingPhone: input.shipping!.phone,
        shippingEmail: input.shipping!.email,
        shippingAddress: input.shipping!.address,
        shippingCity: input.shipping!.city,
        shippingRegion: input.shipping!.region,
        shippingNotes: input.shipping!.notes,
      };
    }

    // ── Totaux calculés côté serveur — jamais confiés au client ──
    const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * (item.product.price ?? 0), 0);
    const shippingCost = subtotal >= env.FREE_SHIPPING_THRESHOLD ? 0 : env.DEFAULT_SHIPPING_COST;
    const total = subtotal + shippingCost;

    const paymentMethod = PAYMENT_METHOD_FROM_API[input.paymentMethod];
    // Le cash est réglé à la livraison : la transaction reste "pending"
    // jusqu'à confirmation. Les autres moyens sont considérés déjà
    // confirmés à ce stade (webhook/redirection PSP en amont, en production).
    const initialStatus = input.paymentMethod === "cash" ? "PENDING" : "PAID";
    const transactionStatus = input.paymentMethod === "cash" ? "PENDING" : "SUCCESS";

    try {
      const order = await ordersRepository.createOrderTransactional({
        userId,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceSnapshot: item.product.price ?? 0,
          titleSnapshot: item.product.title,
          imageSnapshot: item.product.images[0]?.url ?? null,
          skuSnapshot: item.product.sku,
        })),
        shipping,
        paymentMethod,
        subtotal,
        shippingCost,
        total,
        initialStatus,
        transactionStatus,
      });

      return toOrderDto(order as any);
    } catch (err) {

      if (err instanceof Error && err.message.startsWith("STOCK_INSUFFICIENT:")) {
        const productId = err.message.split(":")[1];
        throw new ConflictError("Le stock de certains articles a changé entre-temps.", { productId });
      }
      throw err;
    }
  },

  async list(userId: string, page?: number, limit?: number) {
    const pagination = normalizePagination(page, limit);
    const [orders, totalItems] = await ordersRepository.findManyByUser(
      userId,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );
    return buildPaginatedResult(orders.map(toOrderDto), totalItems, pagination);
  },

  async getById(userId: string, orderId: string) {
    const order = await assertOwnership(orderId, userId);
    return toOrderDto(order);
  },

  async cancel(userId: string, orderId: string) {
    const order = await assertOwnership(orderId, userId);

    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      throw new ConflictError("Une commande déjà expédiée ou livrée ne peut plus être annulée.");
    }
    if (order.status === "CANCELLED") {
      throw new ConflictError("Cette commande est déjà annulée.");
    }

    await ordersRepository.restoreStock(orderId);
    const updated = await ordersRepository.updateStatus(orderId, "CANCELLED");
    return toOrderDto(updated);
  },

  /** Réservé aux administrateurs : fait progresser une commande dans son cycle de vie. */
  async adminUpdateStatus(orderId: string, statusApi: string) {
    const order = await ordersRepository.findById(orderId);
    if (!order) throw new NotFoundError("Commande");

    const statusKey = statusApi.toLowerCase().replaceAll("_", "-");
    const nextStatus = ORDER_STATUS_FROM_API[statusApi] ?? ORDER_STATUS_FROM_API[statusKey];
    if (!nextStatus) throw new BadRequestError("Statut de commande invalide.");
    const updated = await ordersRepository.updateStatus(orderId, nextStatus);

    if (nextStatus === "SHIPPED") {
      await notificationsService
        .notifyOrderShipped(updated)
        .catch((err) => logger.error({ err, orderId }, "Échec de la création de la notification d'expédition"));
    }
    if (nextStatus === "DELIVERED") {
      await notificationsService
        .notifyOrderDelivered(updated)
        .catch((err) => logger.error({ err, orderId }, "Échec de la création de la notification de livraison"));
    }

    return toOrderDto(updated);
  },
};
