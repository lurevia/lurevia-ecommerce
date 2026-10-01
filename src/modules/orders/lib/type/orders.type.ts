import type { Order, OrderItem, Transaction, ProvinceMadagascar, RegionMadagascar, OrderStatus, PaymentMethod, TransactionStatus, DeliveryMode } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export type OrderWithRelations = Order & {
  items: OrderItem[];
  transactions: Transaction[];
  shippingPickupPoint?: {
    id: string;
    name: string;
    provider: string;
    city: string;
  } | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface OrderItemInput {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  titleSnapshot: string;
  imageSnapshot: string | null;
  skuSnapshot: string;
  colorSnapshot?: string | null;
  sizeSnapshot?: string | null;
}

export interface ShippingInput {
  shippingFullName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingProvince: ProvinceMadagascar;
  shippingRegion: RegionMadagascar;
  shippingCity: string;
  shippingNeighborhood?: string;
  shippingAddress: string;
  shippingNotes?: string;
}

export interface CheckoutParams {
  userId: string;
  orderNumber: string;
  items: OrderItemInput[];
  shipping: ShippingInput;

  deliveryMode: DeliveryMode;
  shippingZoneId?: string;
  shippingPickupPointId?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryAccuracy?: number;

  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  total: number;
  initialStatus: OrderStatus;
  transactionStatus: TransactionStatus;
  codAmountExpected?: number;
}
