import slugify from "slugify";
import { prisma } from "../lib/prisma";

const baseSlug = (value: string): string =>
  slugify(value, { lower: true, strict: true, locale: "fr" });

export const generateUniqueProductSlug = async (title: string, excludeId?: string): Promise<string> => {
  const slug = baseSlug(title);
  let candidate = slug;
  let suffix = 2;


  for (;;) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
};
