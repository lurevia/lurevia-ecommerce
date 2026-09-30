/**
 * Formate un montant en Ariary avec séparateurs d'espace.
 * Exemple : 1250000 → "1 250 000 Ar"
 */
export function formatAriary(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\u202f/g, " ")} Ar`;
}

/**
 * Convertit un montant en string pour stockage (toujours un entier).
 */
export function parseAriary(input: string | number): number {
  const n = typeof input === "number" ? input : Number(input.replace(/[^\d-]/g, ""));
  if (!Number.isInteger(n)) {
    throw new Error("Le montant doit être un entier (pas de centimes en Ariary)");
  }
  return n;
}