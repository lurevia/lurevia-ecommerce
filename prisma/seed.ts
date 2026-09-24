// prisma/seed.ts
import {
  PrismaClient,
  AuthIdentifier,
  AuthProvider,
  Role,
  ProductPricingMode,
} from "@prisma/client";
import categoriesData from "./seed-src/categories.json";
import productsData from "./seed-src/products.json";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// TYPES (matching seed-src JSON)
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

/** Slug simplifié, cohérent avec src/utils/slug.ts. */
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
  console.log("🌱 Démarrage du seed...\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CATÉGORIES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("📁 Import des catégories...");

  const categories = categoriesData as SeedCategory[];
  const slugToCategoryId = new Map<string, string>();

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        bannerUrl: cat.bannerUrl,
        position: i,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        bannerUrl: cat.bannerUrl,
        position: i,
      },
    });
    slugToCategoryId.set(cat.slug, created.id);
  }
  console.log(`   ✅ ${categories.length} catégories importées\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PRODUITS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("📦 Import des produits...");

  const products = productsData as SeedProduct[];
  let productCount = 0;
  let skippedCount = 0;

  for (const p of products) {
    const categoryIds = p.categorySlugs
      .map((slug) => slugToCategoryId.get(slug))
      .filter((id): id is string => Boolean(id));

    if (categoryIds.length === 0) {
      console.warn(`   ⚠️  Produit "${p.title}" ignoré : aucune catégorie valide`);
      skippedCount += 1;
      continue;
    }

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        // Ne pas écraser les modifs manuelles en prod — on laisse vide.
      },
      create: {
        title: p.title,
        slug: slugifyForSeed(p.title),
        sku: p.sku,
        description: p.description,
        longDescription: p.longDescription,

        // ─── Prix ───
        pricingMode: ProductPricingMode.FIXED,
        price: p.price,
        originalPrice: p.originalPrice,

        // ─── Stock ───
        stock: p.stock,
        lowStockThreshold: 5,
        isActive: true,
        isNew: p.isNew ?? false,

        // ─── Métadonnées ───
        tags: p.tags ?? [],
        ratingCache: p.rating ?? 0,
        reviewCountCache: p.reviewCount ?? 0,

        // ─── Relations imbriquées ───
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
  console.log(`   ✅ ${productCount} produits importés`);
  if (skippedCount > 0) {
    console.log(`   ⚠️  ${skippedCount} produits ignorés (catégorie manquante)`);
  }
  console.log("");

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ZONES DE LIVRAISON
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("🚚 Import des zones de livraison...");

  const shippingZones = [
    {
      name: "Antananarivo — Centre",
      regions: ["Analamanga"],
      basePrice: 4000,
      pricePerKg: 1000,
      estimatedDays: 1,
    },
    {
      name: "Antananarivo — Périphérie",
      regions: ["Analamanga"],
      basePrice: 7000,
      pricePerKg: 1500,
      estimatedDays: 2,
    },
    {
      name: "Province — Nord",
      regions: ["Diana", "Sava", "Sofia"],
      basePrice: 25000,
      pricePerKg: 3000,
      estimatedDays: 5,
    },
    {
      name: "Province — Centre",
      regions: ["Itasy", "Vakinankaratra", "Amoron'i Mania"],
      basePrice: 20000,
      pricePerKg: 2500,
      estimatedDays: 4,
    },
    {
      name: "Province — Sud",
      regions: ["Atsimo-Andrefana", "Androy", "Anosy"],
      basePrice: 30000,
      pricePerKg: 3500,
      estimatedDays: 7,
    },
    {
      name: "Province — Est",
      regions: ["Atsinanana", "Analanjirofo", "Vatovavy", "Fitovinany"],
      basePrice: 28000,
      pricePerKg: 3000,
      estimatedDays: 6,
    },
    {
      name: "Province — Ouest",
      regions: ["Menabe", "Melaky", "Boeny", "Betsiboka"],
      basePrice: 27000,
      pricePerKg: 3000,
      estimatedDays: 6,
    },
  ];

  for (const zone of shippingZones) {
    await prisma.shippingZone.upsert({
      where: { name: zone.name },
      update: {
        regions: zone.regions,
        basePrice: zone.basePrice,
        pricePerKg: zone.pricePerKg,
        estimatedDays: zone.estimatedDays,
        isActive: true,
      },
      create: {
        name: zone.name,
        regions: zone.regions,
        basePrice: zone.basePrice,
        pricePerKg: zone.pricePerKg,
        estimatedDays: zone.estimatedDays,
        isActive: true,
      },
    });
  }
  console.log(`   ✅ ${shippingZones.length} zones de livraison importées\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. COMPTES DE DÉMONSTRATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("👤 Création des comptes de démonstration...");

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
      primaryIdentifier: AuthIdentifier.EMAIL,
      primaryProvider: AuthProvider.LOCAL,
      role: Role.ADMIN,
      emailVerified: true,
      phoneVerified: true,
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
      primaryIdentifier: AuthIdentifier.EMAIL,
      primaryProvider: AuthProvider.LOCAL,
      role: Role.CUSTOMER,
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
    },
  });

  // ─── Vendeur démo (optionnel, montre le rôle SELLER) ───
  const sellerPassword = await hashPassword("Seller1234!");
  await prisma.user.upsert({
    where: { email: "seller@lurevia.mg" },
    update: {},
    create: {
      fullName: "Artisan Démo",
      email: "seller@lurevia.mg",
      phone: "+261342222222",
      passwordHash: sellerPassword,
      primaryIdentifier: AuthIdentifier.EMAIL,
      primaryProvider: AuthProvider.LOCAL,
      role: Role.SELLER,
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
    },
  });

  console.log("   ✅ 3 comptes créés :");
  console.log("      - admin@lurevia.mg  / Admin1234!   (ADMIN)");
  console.log("      - seller@lurevia.mg / Seller1234!  (SELLER)");
  console.log("      - client@lurevia.mg / Client1234!  (CUSTOMER)\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // FIN
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("🌱 Seed terminé avec succès\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXÉCUTION
// ─────────────────────────────────────────────────────────────────────────────

main()
  .catch((err) => {
    console.error("❌ Erreur durant le seed :\n", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });