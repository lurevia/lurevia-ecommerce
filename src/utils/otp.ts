import crypto from "node:crypto";

/**
 * Génère un code OTP numérique à 6 chiffres.
 * Utilise crypto.randomInt pour éviter les biais de Math.random.
 */
export function generateOtp(length = 6): string {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, "0");
}

/**
 * Hash un OTP (SHA-256) pour stockage sécurisé.
 */
export function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Vérifie un OTP en temps constant (anti timing attack).
 */
export function verifyOtp(input: string, storedHash: string): boolean {
  const inputHash = hashOtp(input);
  return crypto.timingSafeEqual(
    Buffer.from(inputHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}