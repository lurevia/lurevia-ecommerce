import { shippingZonesService } from "../../../shipping-zones/services/shipping-zones.service";
import { prisma } from "../../../../lib/prisma";
import type { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcule les frais de livraison.
 *
 * Ordre de calcul :
 *   1. Seuil de gratuité atteint → 0 Ar
 *   2. Zone exacte par région → tarif de la zone
 *   3. Fallback zone par province
 *   4. Fallback frais par défaut (settings)
 */
export async function computeShippingCost(params: {
  province: ProvinceMadagascar;
  region: RegionMadagascar;
  subtotal: number;
  deliveryMode: "HOME_DELIVERY" | "PICKUP_POINT";
}): Promise<{ cost: number; zoneId?: string; }> {
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
  });

  // 1. Seuil de gratuité
  const freeThreshold = settings?.freeShippingThreshold ?? 250_000;
  if (params.subtotal >= freeThreshold) {
    return { cost: 0 };
  }

  // 2. & 3. Cherche la zone (région exacte → province → rien)
  const { cost, zoneId } = await shippingZonesService.findForRegion(
    params.region,
    params.province
  );

  if (cost > 0 && zoneId) {
    return { cost, zoneId };
  }

  // 4. Fallback : frais par défaut
  return { cost: settings?.defaultShippingCost ?? 8_000 };
}
