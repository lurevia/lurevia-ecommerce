import type { Address, PickupPoint } from "@prisma/client";

/**
 * Résumé d'un point relais (3 champs uniquement).
 * Dérivé de PickupPoint pour éviter la duplication.
 */
export type PickupPointSummary = Pick<
  PickupPoint,
  "id" | "name" | "provider"
>;

/**
 * Résultat du repository quand la relation pickupPoint est incluse.
 * Compose Address + un point relais optionnel.
 */
export type AddressWithPickup = Address & {
  pickupPoint: PickupPointSummary | null;
};