import crypto from "node:crypto";

/**
 * Génère un numéro de commande lisible : LUR-2026-A1B2C3
 * - LUR : préfixe Lurevia
 * - 2026 : année
 * - A1B2C3 : 6 caractères aléatoires (base32)
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789"; // pas de O/0/I/1
  const random = Array.from(crypto.randomBytes(6))
    .map((b) => alphabet[b % alphabet.length])
    .join("");
  return `LUR-${year}-${random}`;
}

/**
 * Génère une référence de transaction mobile money.
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `TXN-${timestamp}-${random}`;
}

/**
 * Génère une idempotency key pour un paiement.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}