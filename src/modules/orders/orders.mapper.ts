import type { Order, OrderItem, OrderStatus, PaymentMethod, Transaction, TransactionStatus } from "@prisma/client";

const PAYMENT_METHOD_TO_API: Record<PaymentMethod, "mobile-money" | "card" | "cash" | "bank-transfer"> = {
  MOBILE_MONEY: "mobile-money",
  CARD: "card",
  COD: "cash",
  BANK_TRANSFERT: "bank-transfer",
};

export const PAYMENT_METHOD_FROM_API: Record<"mobile-money" | "card" | "cash" | "bank-transfer", PaymentMethod> = {
  "mobile-money": "MOBILE_MONEY",
  card: "CARD",
  cash: "COD",
  "bank-transfer": "BANK_TRANSFERT",
};

const ORDER_STATUS_TO_API: Record<OrderStatus, string> = {
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

const TRANSACTION_STATUS_TO_API: Record<TransactionStatus, string> = {
  SUCCESS: "success",
  PENDING: "pending",
  FAILED: "failed",
  INITIATED: "initiated",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

type OrderWithRelations = Order & { items: OrderItem[]; transactions: Transaction[] };

export const toOrderDto = (order: OrderWithRelations) => ({
  id: order.id,
  userId: order.userId,
  status: ORDER_STATUS_TO_API[order.status],
  paymentMethod: PAYMENT_METHOD_TO_API[order.paymentMethod],
  shipping: {
    fullName: order.shippingFullName,
    phone: order.shippingPhone,
    email: order.shippingEmail,
    address: order.shippingAddress,
    city: order.shippingCity,
    region: order.shippingRegion,
    notes: order.shippingNotes ?? undefined,
  },
  items: order.items.map((item) => ({
    productId: item.productId,
    title: item.titleSnapshot,
    imageUrl: item.imageSnapshot,
    price: item.priceSnapshot,
    quantity: item.quantity,
  })),
  transactions: order.transactions.map((t) => ({
    id: t.id,
    orderId: t.orderId,
    amount: t.amount,
    method: PAYMENT_METHOD_TO_API[t.method],
    status: TRANSACTION_STATUS_TO_API[t.status],
    date: t.createdAt.toISOString(),
  })),
  subtotal: order.subtotal,
  shippingCost: order.shippingCost,
  total: order.total,
  createdAt: order.createdAt.toISOString(),
});
