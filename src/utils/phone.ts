/**
 * Normalise un numéro de téléphone malgache au format E.164 (+261XXXXXXXXX).
 * Accepte : 0341234567, 034 12 345 67, +261341234567, 261341234567
 * Retourne null si le format est invalide.
 */
export function normalizeMalagasyPhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-().]/g, "");

  // 0341234567 (10 chiffres, commence par 0)
  if (/^0(32|33|34|37|38)\d{7}$/.test(cleaned)) {
    return `+261${cleaned.slice(1)}`;
  }

  // 261341234567 (12 chiffres)
  if (/^261(32|33|34|37|38)\d{7}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // +261341234567 (13 caractères avec +)
  if (/^\+261(32|33|34|37|38)\d{7}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Vérifie si un numéro est un mobile money valide selon l'opérateur.
 */
export function detectMobileMoneyProvider(phone: string): "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY" | null {
  const normalized = normalizeMalagasyPhone(phone);
  if (!normalized) return null;

  const prefix = normalized.slice(4, 6); // 2 chiffres après +261
  if (prefix === "34" || prefix === "38") return "MVOLA";         // Telma
  if (prefix === "32" || prefix === "37") return "ORANGE_MONEY";  // Orange
  if (prefix === "33" || prefix == "35") return "AIRTEL_MONEY";   // Airtel
  return null;
}