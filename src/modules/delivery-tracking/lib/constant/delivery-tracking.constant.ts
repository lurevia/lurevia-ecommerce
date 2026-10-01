import type { OrderStatus } from "@prisma/client";

export const DELIVERABLE_STATUSES: OrderStatus[] = ["PAID", "COD_PENDING", "SHIPPED"];
