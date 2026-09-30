// prisma/seed.ts
import {
  PrismaClient,
  AuthIdentifier,
  AuthProvider,
  Role,
  ProductPricingMode,
} from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

interface SeedColor {
  label: string;
  hex: string;
}

interface SeedProduct {
  sku: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  stock: number;
  isNew?: boolean;
  tags: string[];
  colors?: SeedColor[];
  sizes?: string[];
  pricingMode?: ProductPricingMode;
  minPrice?: number;
  maxPrice?: number;
}

interface SeedCategory {
  slug: string;
  name: string;
  description: string;
  iconName: string;
  position: number;
  products: SeedProduct[];
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════════

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function productImages(sku: string, count = 3): string[] {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/${sku.toLowerCase()}-${i}/800/800`
  );
}

function categoryImage(slug: string, kind: "card" | "banner"): string {
  const dims = kind === "card" ? "600/600" : "1600/400";
  return `https://picsum.photos/seed/cat-${slug}-${kind}/${dims}`;
}

const REALISTIC_STOCK = () => Math.floor(Math.random() * 40) + 5;
const REALISTIC_RATING = () => Math.round((4 + Math.random()) * 10) / 10;
const REALISTIC_REVIEWS = () => Math.floor(Math.random() * 80) + 3;

// ═════════════════════════════════════════════════════════════════════════════
// CATÉGORIES + PRODUITS (10 × 10 = 100 produits)
// ═════════════════════════════════════════════════════════════════════════════

const CATEGORIES: SeedCategory[] = [
  // [COLLE ICI TON TABLEAU EXISTANT DES 10 CATÉGORIES]
  // ⚠️ Ne réécris rien — le tableau est déjà dans ton fichier actuel
  // (10 catégories × 10 produits = 100 produits).
];

// ═════════════════════════════════════════════════════════════════════════════
// 1. PLATFORM SETTINGS (SINGLETON)
// ═════════════════════════════════════════════════════════════════════════════

async function seedPlatformSettings() {
  console.log("\n⚙️  PlatformSettings…");

  await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Lurevia",
      siteTagline: "Artisanat malgache authentique",
      siteDescription:
        "Découvrez l'artisanat malgache fait main, livré partout à Madagascar.",
      contactEmail: "contact@lurevia.mg",
      contactPhone: "+261 34 12 345 67",
      contactAddress: "Antananarivo, Madagascar",
      defaultCurrency: "MGA",

      primaryColor: "#2F7BF6",
      secondaryColor: "#0A1B3D",
      accentColor: "#E8A33D",

      freeShippingThreshold: 250_000,
      defaultShippingCost: 8_000,
      homeDeliveryEnabled: true,
      pickupPointEnabled: true,

      enableMVola: true,
      enableCOD: true,
      enableCard: false,
      enableBankTransfer: false,
      codMaxAmount: 500_000,

      requireCinForSellers: true,
      requireCinForCOD: false,
      cinVerificationEnabled: true,
      allowMinorWithGuardian: true,
      minorAgeThreshold: 18,

      auctionsEnabled: true,
      auctionMinIncrement: 1_000,
      auctionAutoExtendMinutes: 2,
      auctionDefaultDurationH: 24,
      auctionChatEnabled: true,
      auctionChatModeration: true,
    },
  });

  console.log("   ✅ PlatformSettings créé");
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. ADMIN PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════

async function seedAdmin() {
  console.log("\n👤 Admin principal…");

  const isProduction = process.env.NODE_ENV === "production";

  const adminEmail = (
    process.env.INITIAL_ADMIN_EMAIL || "admin@lurevia.mg"
  ).toLowerCase();
  const adminPhone = process.env.INITIAL_ADMIN_PHONE || "+261340000000";
  const adminPasswordRaw =
    process.env.INITIAL_ADMIN_PASSWORD || "Admin12345!";

  if (isProduction && adminPasswordRaw.length < 12) {
    throw new Error(
      "INITIAL_ADMIN_PASSWORD doit contenir au moins 12 caractères en production."
    );
  }

  const passwordHash = await hashPassword(adminPasswordRaw);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
    },
    create: {
      fullName: "Administrateur Principal",
      email: adminEmail,
      phone: adminPhone,
      passwordHash,
      primaryIdentifier: AuthIdentifier.EMAIL,
      primaryProvider: AuthProvider.LOCAL,
      role: Role.ADMIN,
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
    },
  });

  console.log(`   ✅ Admin : ${adminEmail}`);
  return admin;
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. CATÉGORIES + PRODUITS
// ═════════════════════════════════════════════════════════════════════════════

async function seedCategoriesAndProducts() {
  console.log("\n📁 Catégories et produits…\n");

  let totalCategories = 0;
  let totalProducts = 0;
  let totalSkipped = 0;

  for (const category of CATEGORIES) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        iconName: category.iconName,
        position: category.position,
        imageUrl: categoryImage(category.slug, "card"),
        bannerUrl: categoryImage(category.slug, "banner"),
      },
    });
    totalCategories += 1;

    console.log(`📂 ${category.name}`);

    for (const p of category.products) {
      const existing = await prisma.product.findUnique({
        where: { sku: p.sku },
      });
      if (existing) {
        totalSkipped += 1;
        continue;
      }

      await prisma.product.create({
        data: {
          title: p.title,
          slug: slugify(p.title),
          sku: p.sku,
          description: p.description,
          longDescription: p.longDescription,
          pricingMode: p.pricingMode ?? ProductPricingMode.FIXED,
          price: p.price,
          originalPrice: p.originalPrice,
          minPrice: p.minPrice,
          maxPrice: p.maxPrice,
          stock: p.stock,
          lowStockThreshold: 5,
          isActive: true,
          isNew: p.isNew ?? false,
          tags: p.tags,
          ratingCache: REALISTIC_RATING(),
          reviewCountCache: REALISTIC_REVIEWS(),
          images: {
            create: productImages(p.sku, 3).map((url, i) => ({
              url,
              position: i,
            })),
          },
          colors: p.colors
            ? { create: p.colors.map((c) => ({ label: c.label, hex: c.hex })) }
            : undefined,
          sizes: p.sizes
            ? { create: p.sizes.map((value) => ({ value })) }
            : undefined,
          categories: {
            create: [{ categoryId: createdCategory.id }],
          },
        },
      });

      totalProducts += 1;
    }

    console.log(`   ✅ ${category.products.length} produits traités`);
  }

  console.log(
    `\n📊 Bilan : ${totalCategories} catégories, ${totalProducts} produits créés, ${totalSkipped} déjà présents.`
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("🚀 Démarrage du seed Lurevia…\n");

  await seedPlatformSettings();
  await seedAdmin();
  await seedCategoriesAndProducts();

  console.log("\n🌱 Seed terminé avec succès.\n");
  console.log("👤 Compte admin :");
  console.log(
    `   ${process.env.INITIAL_ADMIN_EMAIL || "admin@lurevia.mg"} / ${process.env.INITIAL_ADMIN_PASSWORD || "Admin12345!"}`
  );
  console.log(
    "\n💡 Inscris-toi toi-même comme client via POST /api/v1/auth/register\n"
  );
}

main()
  .catch((err) => {
    console.error("❌ Erreur durant le seed :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });