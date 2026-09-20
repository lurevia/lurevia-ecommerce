const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Convertit une durée exprimée en chaîne courte (ex: "15m", "30d", "12h")
 * en millisecondes. Volontairement minimal — évite une dépendance externe
 * pour un besoin aussi simple.
 */
export default function ms(value: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d|w)$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Format de durée invalide : "${value}" (attendu ex: "15m", "30d")`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit.toLowerCase()];
}
