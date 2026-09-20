import slugify from "slugify";
import { prisma } from "../lib/prisma";

const baseSlug = (value: string): string =>
  slugify(value, { lower: true, strict: true, locale: "fr" });

/**
 * Génère un slug unique pour un produit en suffixant "-2", "-3"... en cas de
 * collision, plutôt que d'échouer sur la contrainte unique en base.
 */
export const generateUniqueProductSlug = async (title: string, excludeId?: string): Promise<string> => {
  const slug = baseSlug(title);
  let candidate = slug;
  let suffix = 2;

  // Boucle bornée par construction (le nombre de produits est fini) — pas de
  // risque de boucle infinie en pratique.
  for (;;) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
};
