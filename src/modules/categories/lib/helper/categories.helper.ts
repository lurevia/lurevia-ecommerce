import slugify from "slugify";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export const toSlug = (name: string) =>
  slugify(name, { lower: true, strict: true, locale: "fr" });
