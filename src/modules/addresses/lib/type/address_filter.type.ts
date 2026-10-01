import type {
  ProvinceMadagascar,
  RegionMadagascar,
} from "@prisma/client";

/**
 * Filtres internes pour lister les adresses.
 * Utilisé par le service pour construire un `where` Prisma.
 *
 * Chaque champ est optionnel : un filtre absent n'est pas appliqué.
 */
export type AddressFilter = {
  userId?: string;
  isDefault?: boolean;
  province?: ProvinceMadagascar;
  region?: RegionMadagascar;
  city?: string;
};