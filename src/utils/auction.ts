import { env } from "../config/env";

/**
 * Vérifie si une offre est valide selon les règles de l'enchère.
 */
export function isValidBid(params: {
  proposedPrice: number;
  currentPrice: number | null;
  startPrice: number;
  minIncrement?: number;
}): { valid: true } | { valid: false; reason: string; minimumRequired: number } {
  const increment = params.minIncrement ?? env.AUCTION_MIN_INCREMENT;
  const minimumRequired = params.currentPrice
    ? params.currentPrice + increment
    : params.startPrice;

  if (params.proposedPrice < minimumRequired) {
    return {
      valid: false,
      reason: `Offre trop basse. Minimum : ${minimumRequired} Ar`,
      minimumRequired,
    };
  }
  return { valid: true };
}

/**
 * Anti-snipe : si une offre arrive dans les X dernières minutes,
 * on prolonge l'enchère de X minutes.
 */
export function shouldExtendAuction(endAt: Date): { extend: boolean; newEndAt?: Date } {
  const now = Date.now();
  const threshold = env.AUCTION_ANTI_SNIPE_MINUTES * 60 * 1000;
  const timeLeft = endAt.getTime() - now;

  if (timeLeft > 0 && timeLeft < threshold) {
    return {
      extend: true,
      newEndAt: new Date(now + threshold),
    };
  }
  return { extend: false };
}

/**
 * Vérifie si le prix de réserve est atteint.
 */
export function isReserveMet(currentPrice: number, reservePrice: number | null): boolean {
  if (reservePrice === null) return true; // pas de réserve = toujours OK
  return currentPrice >= reservePrice;
}