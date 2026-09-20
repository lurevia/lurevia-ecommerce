import type { Order, OrderItem, OrderStatus, PaymentMethod, Transaction, TransactionStatus } from "@prisma/client";

const PAYMENT_METHOD_TO_API: Record<PaymentMethod, "mobile-money" | "card" | "cash"> = {
  MOBILE_MONEY: "mobile-money",
  CARD: "card",
  CASH: "cash",
};

export const PAYMENT_METHOD_FROM_API: Record<"mobile-money" | "card" | "cash", PaymentMethod> = {
  "mobile-money": "MOBILE_MONEY",
  card: "CARD",
  cash: "CASH",
};

const ORDER_STATUS_TO_API: Record<OrderStatus, string> = {
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_FROM_API: Record<string, OrderStatus> = {
  pending: "PENDING",
  paid: "PAID",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

const TRANSACTION_STATUS_TO_API: Record<TransactionStatus, string> = {
  SUCCESS: "success",
  PENDING: "pending",
  FAILED: "failed",
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
