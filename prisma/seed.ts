import { PrismaClient } from "@prisma/client";
import categoriesData from "./seed-src/categories.json";
import productsData from "./seed-src/products.json";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SeedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
}

interface SeedProduct {
  id: string;
  title: string;
  categorySlugs: string[];
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  longDescription?: string;
  colors?: { label: string; hex: string }[];
  stock: number;
  sku: string;
  isNew?: boolean;
  tags?: string[];
  sizes?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Génération de slug simplifiée, cohérente avec src/utils/slug.ts
 *  mais sans dépendance à Prisma en amont. */
function slugifyForSeed(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Démarrage du seed...");

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CATÉGORIES
  // ═══════════════════════════════════════════════════════════════════════════

  const categories = categoriesData as SeedCategory[];
  const slugToCategoryId = new Map<string, string>();

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        bannerUrl: cat.bannerUrl,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        bannerUrl: cat.bannerUrl,
      },
    });
    slugToCategoryId.set(cat.slug, created.id);
  }
  console.log(`✅ ${categories.length} catégories importées`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PRODUITS
  // ═══════════════════════════════════════════════════════════════════════════

  const products = productsData as SeedProduct[];
  let productCount = 0;

  for (const p of products) {
    const categoryIds = p.categorySlugs
      .map((slug) => slugToCategoryId.get(slug))
      .filter((id): id is string => Boolean(id));

    if (categoryIds.length === 0) {
      console.warn(`⚠️  Produit "${p.title}" ignoré : aucune catégorie valide`);
      continue;
    }

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        title: p.title,
        slug: slugifyForSeed(p.title),
        sku: p.sku,
        description: p.description,
        longDescription: p.longDescription,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        isNew: p.isNew ?? false,
        tags: p.tags ?? [],
        ratingCache: p.rating ?? 0,
        reviewCountCache: p.reviewCount ?? 0,
        images: {
          create: p.images.map((url, position) => ({ url, position })),
        },
        colors: {
          create: (p.colors ?? []).map((c) => ({
            label: c.label,
            hex: c.hex,
          })),
        },
        sizes: {
          create: (p.sizes ?? []).map((value) => ({ value })),
        },
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });
    productCount += 1;
  }
  console.log(`✅ ${productCount} produits importés`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. COMPTES DE DÉMONSTRATION
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Admin ───
  const adminPassword = await hashPassword("Admin1234!");
  await prisma.user.upsert({
    where: { email: "admin@lurevia.mg" },
    update: {},
    create: {
      fullName: "Administrateur Lurevia",
      email: "admin@lurevia.mg",
      phone: "+261340000000",
      passwordHash: adminPassword,
      primaryIdentifier: "EMAIL",
      role: "ADMIN",
      isVerified: true,
    },
  });

  // ─── Client démo ───
  const customerPassword = await hashPassword("Client1234!");
  await prisma.user.upsert({
    where: { email: "client@lurevia.mg" },
    update: {},
    create: {
      fullName: "Client Démo",
      email: "client@lurevia.mg",
      phone: "+261341111111",
      passwordHash: customerPassword,
      primaryIdentifier: "EMAIL",
      role: "CUSTOMER",
      isVerified: true,
    },
  });

  console.log(
    "✅ Comptes de démonstration créés (admin@lurevia.mg / client@lurevia.mg — voir README)"
  );

  console.log("🌱 Seed terminé avec succès");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXÉCUTION
// ─────────────────────────────────────────────────────────────────────────────

main()
  .catch((err) => {
    console.error("❌ Erreur durant le seed :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });