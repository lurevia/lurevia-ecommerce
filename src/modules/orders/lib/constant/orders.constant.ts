import type { PaymentMethod, OrderStatus, TransactionStatus, DeliveryMode, Prisma } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// MAPPINGS ENUM ↔ API
// ─────────────────────────────────────────────────────────────────────────────
export const PAYMENT_METHOD_TO_API: Record<PaymentMethod, string> = {
  MOBILE_MONEY: "mobile-money",
  CARD: "card",
  COD: "cash",
  BANK_TRANSFERT: "bank-transfer",
};

export const PAYMENT_METHOD_FROM_API: Record<string, PaymentMethod> = {
  "mobile-money": "MOBILE_MONEY",
  card: "CARD",
  cash: "COD",
  "bank-transfer": "BANK_TRANSFERT",
};

export const ORDER_STATUS_TO_API: Record<OrderStatus, string> = {
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  COD_PENDING: "cod-pending",
  COD_FAILED: "cod-failed",
  REFUNDED: "refunded",
  PAYMENT_FAILED: "payment-failed",
};

export const ORDER_STATUS_FROM_API: Record<string, OrderStatus> = {
  pending: "PENDING",
  paid: "PAID",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  "cod-pending": "COD_PENDING",
  "cod-failed": "COD_FAILED",
  refunded: "REFUNDED",
  "payment-failed": "PAYMENT_FAILED",
};

export const TRANSACTION_STATUS_TO_API: Record<TransactionStatus, string> = {
  SUCCESS: "success",
  PENDING: "pending",
  FAILED: "failed",
  INITIATED: "initiated",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export const DELIVERY_MODE_TO_API: Record<DeliveryMode, string> = {
  HOME_DELIVERY: "home-delivery",
  PICKUP_POINT: "pickup-point",
};

// ─────────────────────────────────────────────────────────────────────────────
// INCLUDE PARTAGÉ
// ─────────────────────────────────────────────────────────────────────────────
export const orderDetailInclude = {
  items: { orderBy: { id: "asc" } },
  transactions: { orderBy: { createdAt: "desc" } },
  shippingPickupPoint: {
    select: { id: true, name: true, provider: true, city: true },
  },
} satisfies Prisma.OrderInclude;
