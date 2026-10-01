import crypto from "node:crypto";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export const generateConfirmationToken = () => crypto.randomBytes(32).toString("hex");
