import type { OrderStatus } from "@prisma/client";

export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Statuts de commande considérés comme "acheté" pour l'éligibilité à un avis.
 * Inclut COD_PENDING car au moment de la commande, le client a fait l'engagement.
 */
export const PURCHASE_STATUSES: OrderStatus[] = [
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "COD_PENDING",
  "COD_FAILED",
];
