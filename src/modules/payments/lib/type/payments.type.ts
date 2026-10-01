import type { Transaction, Order } from "@prisma/client";

export type TransactionWithOrder = Transaction & {
  order: Pick<
    Order,
    "id" | "orderNumber" | "userId" | "total" | "currency" | "status"
  >;
};
