// prisma/seed.ts
import {
  PrismaClient,
  AuthIdentifier,
  AuthProvider,
  Role,
  ProductPricingMode,
  IdentityDocumentType,
  IdentityVerificationStatus,
  SellerContractType,
  SellerContractStatus,
  ProvinceMadagascar,
  RegionMadagascar,
} from "@prisma/client";
import { hashPassword } from "../src/utils/password";
import { seedDemoData } from "./seed/demo-data";

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
  categorySlug: string;
  ownerEmail: string;
}

interface SeedCategory {
  slug: string;
  name: string;
  description: string;
  iconName: string;
  position: number;
}

interface SeedSeller {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  cinNumber: string;
  storeName: string;
  storeDescription: string;
  contractType: SellerContractType;
  contractValue: number;
  province: ProvinceMadagascar;
  region: RegionMadagascar;
  storeCategorySlug: string;
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

function sellerLogo(email: string): string {
  return `https://picsum.photos/seed/store-${email.split("@")[0]}/400/400`;
}

const REALISTIC_STOCK = () => Math.floor(Math.random() * 40) + 5;
const REALISTIC_RATING = () => Math.round((4 + Math.random()) * 10) / 10;
const REALISTIC_REVIEWS = () => Math.floor(Math.random() * 80) + 3;
const SEED_DEMO_DATA = process.env.NODE_ENV !== "production" && process.env.SEED_DEMO_DATA !== "false";

// ═════════════════════════════════════════════════════════════════════════════
// DONNÉES : VENDEURS
// ═════════════════════════════════════════════════════════════════════════════

const SELLER_TEMPLATES: SeedSeller[] = [
  {
    email: "rakoto.artisan@lurevia.mg",
    phone: "+261341000001",
    fullName: "Rakoto Andrianina",
    password: "Seller1234!",
    cinNumber: "101234567890",
    storeName: "Rakoto Artisan",
    storeDescription:
      "Artisanat malgache authentique — sculpture, vannerie et pièces uniques.",
    contractType: SellerContractType.PERCENTAGE,
    contractValue: 10,
    province: ProvinceMadagascar.ANTANANARIVO,
    region: RegionMadagascar.ANALAMANGA,
    storeCategorySlug: "artisanat-decoration",
  },
  {
    email: "soa.beaute@lurevia.mg",
    phone: "+261341000002",
    fullName: "Soa Rakotomalala",
    password: "Seller1234!",
    cinNumber: "201234567890",
    storeName: "Soa Beauté Naturelle",
    storeDescription:
      "Cosmétiques naturels et bijoux artisanaux à base d'ingrédients malgaches.",
    contractType: SellerContractType.PERCENTAGE,
    contractValue: 12,
    province: ProvinceMadagascar.ANTANANARIVO,
    region: RegionMadagascar.ITASY,
    storeCategorySlug: "beaute-soins",
  },
  {
    email: "tiana.mode@lurevia.mg",
    phone: "+261341000003",
    fullName: "Tiana Rasoanaivo",
    password: "Seller1234!",
    cinNumber: "301234567890",
    storeName: "Tiana Mode & Enfants",
    storeDescription:
      "Vêtements en coton, soie sauvage et lin — mode homme, femme et enfants.",
    contractType: SellerContractType.PERCENTAGE,
    contractValue: 15,
    province: ProvinceMadagascar.ANTANANARIVO,
    region: RegionMadagascar.ANALAMANGA,
    storeCategorySlug: "mode-vetements",
  },
  {
    email: "hery.epicerie@lurevia.mg",
    phone: "+261341000004",
    fullName: "Hery Randrianasolo",
    password: "Seller1234!",
    cinNumber: "401234567890",
    storeName: "Hery Épicerie Fine",
    storeDescription:
      "Vanille, épices, chocolat et produits du terroir malgache.",
    contractType: SellerContractType.MONTHLY_FIXED,
    contractValue: 50000,
    province: ProvinceMadagascar.TOAMASINA,
    region: RegionMadagascar.ATSINANANA,
    storeCategorySlug: "epicerie-fine",
  },
  {
    email: "naina.maison@lurevia.mg",
    phone: "+261341000005",
    fullName: "Naina Razafimahatratra",
    password: "Seller1234!",
    cinNumber: "501234567890",
    storeName: "Naina Maison & Sacs",
    storeDescription:
      "Sacs en raphia, textile maison et maroquinerie artisanale.",
    contractType: SellerContractType.PERCENTAGE,
    contractValue: 12,
    province: ProvinceMadagascar.FIANARANTSOA,
    region: RegionMadagascar.HAUTE_MATSIATRA,
    storeCategorySlug: "sacs-maroquinerie",
  },
];

const SELLERS: SeedSeller[] = [
  ...SELLER_TEMPLATES,
  ...Array.from({ length: 95 }, (_, index) => {
    const sellerNumber = index + 6;
    const template = SELLER_TEMPLATES[index % SELLER_TEMPLATES.length];
    return {
      ...template,
      email: `demo.vendeur.${String(sellerNumber).padStart(3, "0")}@lurevia.mg`,
      phone: `+26132${String(sellerNumber).padStart(7, "0")}`,
      fullName: `${template.fullName} ${sellerNumber}`,
      cinNumber: String(800_000_000_000 + sellerNumber),
      storeName: `${template.storeName} ${sellerNumber}`,
    };
  }),
];

// ═════════════════════════════════════════════════════════════════════════════
// DONNÉES : CATÉGORIES
// ═════════════════════════════════════════════════════════════════════════════

const CATEGORIES: SeedCategory[] = [
  {
    slug: "artisanat-decoration",
    name: "Artisanat & Décoration",
    description: "Pièces uniques façonnées main par les artisans malgaches.",
    iconName: "Palette",
    position: 1,
  },
  {
    slug: "bijoux-accessoires",
    name: "Bijoux & Accessoires",
    description: "Bijoux artisanaux en pierres, corne et métaux précieux.",
    iconName: "Gem",
    position: 2,
  },
  {
    slug: "beaute-soins",
    name: "Beauté & Soins",
    description: "Cosmétiques naturels à base d'ingrédients malgaches.",
    iconName: "Sparkles",
    position: 3,
  },
  {
    slug: "mode-vetements",
    name: "Mode & Vêtements",
    description: "Vêtements en coton, soie sauvage et lin naturel.",
    iconName: "Shirt",
    position: 4,
  },
  {
    slug: "enfants-bebe",
    name: "Enfants & Bébé",
    description: "Vêtements et accessoires pour enfants en matières douces.",
    iconName: "Baby",
    position: 5,
  },
  {
    slug: "epicerie-fine",
    name: "Épicerie fine",
    description: "Vanille, épices, chocolat et produits du terroir malgache.",
    iconName: "Coffee",
    position: 6,
  },
  {
    slug: "maison-textile",
    name: "Maison & Textile",
    description: "Linge de maison en coton, soie sauvage et raphia.",
    iconName: "Home",
    position: 7,
  },
  {
    slug: "sacs-maroquinerie",
    name: "Sacs & Maroquinerie",
    description: "Sacs en raphia, cuir et toile, faits main à Madagascar.",
    iconName: "ShoppingBag",
    position: 8,
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// DONNÉES : PRODUITS (50 produits)
// ═════════════════════════════════════════════════════════════════════════════

const PRODUCTS: SeedProduct[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // VENDEUR 1 : RAKOTO ARTISAN — Artisanat & Décoration (10 produits)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    sku: "ART-001",
    title: "Panier tressé en raphia naturel",
    description: "Grand panier tressé main, idéal pour le rangement ou la déco.",
    longDescription:
      "Tressé à la main par nos artisans de la région Analamanga. Chaque panier est unique et reflète un savoir-faire transmis de génération en génération.",
    price: 45000,
    originalPrice: 55000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["raphia", "panier", "artisanat"],
    colors: [
      { label: "Naturel", hex: "#D2B48C" },
      { label: "Écru", hex: "#F5F5DC" },
    ],
    sizes: ["M", "L", "XL"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-002",
    title: "Vase en terre cuite sculpté",
    description: "Vase élégant en terre cuite, parfait pour vos plantes séchées.",
    longDescription:
      "Façonné et sculpté à la main. La terre cuite utilisée provient des collines d'Antananarivo.",
    price: 35000,
    stock: REALISTIC_STOCK(),
    tags: ["vase", "terre cuite", "décoration"],
    colors: [
      { label: "Terracotta", hex: "#C86A3E" },
      { label: "Argile", hex: "#B08D57" },
    ],
    sizes: ["20 cm", "30 cm"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-003",
    title: "Statuette en bois de palissandre",
    description: "Statuette sculptée représentant un zébu, symbole malgache.",
    longDescription:
      "Palissandre massif sculpté main. Pièce de collection pour amateurs d'art africain.",
    price: 180000,
    originalPrice: 220000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["bois", "sculpture", "palissandre"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-004",
    title: "Tableau en sable coloré",
    description: "Œuvre d'art en sable naturel coloré, format 30 × 40 cm.",
    longDescription:
      "Technique traditionnelle du sable coloré. Encadré sous verre, prêt à suspendre.",
    price: 120000,
    stock: REALISTIC_STOCK(),
    tags: ["tableau", "sable", "art"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-005",
    title: "Coffret sculpté en bois précieux",
    description: "Boîte à trésors décorée de motifs traditionnels.",
    longDescription:
      "Bois de rose sculpté à la main, intérieur feutré. Idéal pour bijoux ou souvenirs.",
    price: 95000,
    stock: REALISTIC_STOCK(),
    tags: ["coffret", "bois", "bijoux"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-006",
    title: "Boîte à bijoux en bois de rose",
    description: "Élégant écrin avec compartiments et miroir intérieur.",
    longDescription:
      "Finition vernie brillante. Compartiments ajustables pour bagues, colliers et bracelets.",
    price: 135000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["boîte", "bijoux", "bois de rose"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-007",
    title: "Photophore en bambou tressé",
    description: "Photophore naturel qui diffuse une lumière chaleureuse.",
    longDescription: "Bambou tressé main. Compatible bougies chauffe-plat et LED.",
    price: 28000,
    stock: REALISTIC_STOCK(),
    tags: ["photophore", "bambou", "lumière"],
    sizes: ["Petit", "Moyen"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-008",
    title: "Lampe en raphia suspendue",
    description: "Suspension artisanale en raphia, ambiance naturelle et douce.",
    longDescription:
      "Abat-jour en raphia tissé. Câble électrique conforme aux normes, ampoule E27 non fournie.",
    price: 165000,
    originalPrice: 195000,
    stock: REALISTIC_STOCK(),
    tags: ["lampe", "raphia", "suspension"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-009",
    title: "Coupelle décorative en pierre",
    description: "Coupelle en pierre polie pour bijoux ou petits objets.",
    longDescription:
      "Pierre naturelle extraite et polie à la main. Chaque pièce a ses nuances propres.",
    price: 42000,
    stock: REALISTIC_STOCK(),
    tags: ["coupelle", "pierre", "décoration"],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },
  {
    sku: "ART-010",
    title: "Cadre photo sculpté",
    description: "Cadre en bois sculpté avec motifs géométriques traditionnels.",
    longDescription: "Bois massif sculpté main. Compatible photo 10 × 15 cm.",
    price: 38000,
    stock: REALISTIC_STOCK(),
    tags: ["cadre", "photo", "bois"],
    colors: [
      { label: "Naturel", hex: "#8B5A2B" },
      { label: "Foncé", hex: "#3B2417" },
    ],
    categorySlug: "artisanat-decoration",
    ownerEmail: "rakoto.artisan@lurevia.mg",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDEUR 2 : SOA BEAUTÉ — Bijoux (6) + Beauté (6) = 12 produits
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Bijoux (6) ───
  {
    sku: "BIJ-001",
    title: "Collier en perles de pierres naturelles",
    description: "Collier élégant en pierres semi-précieuses malgaches.",
    longDescription:
      "Perles de pierres naturelles (jaspe, agate, quartz) montées sur fil de soie.",
    price: 85000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["collier", "perles", "pierres"],
    categorySlug: "bijoux-accessoires",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BIJ-002",
    title: "Bracelet en corne de zébu",
    description: "Bracelet manchette en corne polie, design contemporain.",
    longDescription:
      "Corne de zébu travaillée et polie à la main. Pièce unique, écologique et élégante.",
    price: 65000,
    originalPrice: 80000,
    stock: REALISTIC_STOCK(),
    tags: ["bracelet", "corne", "zébu"],
    colors: [
      { label: "Noir", hex: "#1A1A1A" },
      { label: "Brun", hex: "#6B4423" },
    ],
    sizes: ["S", "M", "L"],
    categorySlug: "bijoux-accessoires",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BIJ-003",
    title: "Boucles d'oreilles en argent 925",
    description: "Boucles d'oreilles pendantes en argent massif 925.",
    longDescription: "Argent massif 925, façonnées à la main. Fermoir sécurisé.",
    price: 145000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["boucles", "argent", "bijoux"],
    categorySlug: "bijoux-accessoires",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BIJ-004",
    title: "Bague en pierres semi-précieuses",
    description: "Bague serti d'une pierre de Madagascar.",
    longDescription:
      "Monture en laiton doré avec pierre naturelle taillée à la main.",
    price: 55000,
    stock: REALISTIC_STOCK(),
    tags: ["bague", "pierres", "bijoux"],
    sizes: ["50", "52", "54", "56", "58"],
    categorySlug: "bijoux-accessoires",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BIJ-005",
    title: "Pendentif en raphia tressé",
    description: "Pendentif léger et naturel pour un look bohème.",
    longDescription: "Raphia naturel tressé main. Cordon ajustable en coton bio.",
    price: 22000,
    stock: REALISTIC_STOCK(),
    tags: ["pendentif", "raphia", "bohème"],
    categorySlug: "bijoux-accessoires",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BIJ-006",
    title: "Sautoir en graines de Job",
    description: "Long collier en graines naturelles poncées.",
    longDescription:
      "Graines de larme de Job (Coix lacryma-jobi) sélectionnées et poncées une à une.",
    price: 58000,
    stock: REALISTIC_STOCK(),
    tags: ["sautoir", "graines", "naturel"],
    categorySlug: "bijoux-accessoires",
    ownerEmail: "soa.beaute@lurevia.mg",
  },

  // ─── Beauté (6) ───
  {
    sku: "BEA-001",
    title: "Huile essentielle de baobab",
    description: "Huile pure pressée à froid, riche en vitamines.",
    longDescription:
      "Huile de baobab 100% pure, pressée à froid. Nourrit la peau et les cheveux.",
    price: 58000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["huile", "baobab", "naturel"],
    sizes: ["30 ml", "100 ml"],
    categorySlug: "beaute-soins",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BEA-002",
    title: "Savon artisanal au miel de Madagascar",
    description: "Savon doux saponifié à froid avec miel local.",
    longDescription:
      "Saponification à froid, miel de fleurs sauvages. Convient aux peaux sensibles.",
    price: 18000,
    stock: REALISTIC_STOCK(),
    tags: ["savon", "miel", "artisanal"],
    categorySlug: "beaute-soins",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BEA-003",
    title: "Beurre de karité brut",
    description: "Beurre de karité non raffiné, hydratant intense.",
    longDescription:
      "Karité brut non raffiné, riche en vitamines A et E. Multi-usages.",
    price: 32000,
    originalPrice: 40000,
    stock: REALISTIC_STOCK(),
    tags: ["karité", "hydratant", "naturel"],
    sizes: ["100 g", "250 g"],
    categorySlug: "beaute-soins",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BEA-004",
    title: "Huile de coco vierge bio",
    description: "Huile de coco pressée à froid, usage alimentaire et capillaire.",
    longDescription:
      "Coco pressée à froid, sans additifs. Peut s'utiliser en cuisine, soin peau et cheveux.",
    price: 28000,
    stock: REALISTIC_STOCK(),
    tags: ["coco", "bio", "multi-usage"],
    categorySlug: "beaute-soins",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BEA-005",
    title: "Masque à l'argile verte",
    description: "Masque purifiant à base d'argile naturelle.",
    longDescription:
      "Argile verte + huiles essentielles. Purifie et resserre les pores.",
    price: 24000,
    stock: REALISTIC_STOCK(),
    tags: ["masque", "argile", "purifiant"],
    categorySlug: "beaute-soins",
    ownerEmail: "soa.beaute@lurevia.mg",
  },
  {
    sku: "BEA-006",
    title: "Baume à lèvres au karité",
    description: "Baume hydratant longue durée.",
    longDescription:
      "Karité + cire d'abeille + huile de baobab. Protège du dessèchement.",
    price: 15000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["baume", "lèvres", "karité"],
    categorySlug: "beaute-soins",
    ownerEmail: "soa.beaute@lurevia.mg",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDEUR 3 : TIANA MODE — Mode (8) + Enfants (2) = 10 produits
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Mode (8) ───
  {
    sku: "MOD-001",
    title: "Lamba en soie sauvage",
    description: "Écharpe traditionnelle malgache en soie sauvage.",
    longDescription:
      "Soie sauvage tissée à la main, teintée avec des pigments naturels. Pièce emblématique de Madagascar.",
    price: 185000,
    originalPrice: 220000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["lamba", "soie", "traditionnel"],
    colors: [
      { label: "Rouge terre", hex: "#B33A3A" },
      { label: "Vert forêt", hex: "#2D4A2D" },
    ],
    categorySlug: "mode-vetements",
    ownerEmail: "tiana.mode@lurevia.mg",
  },
  {
    sku: "MOD-002",
    title: "Robe en coton brodé main",
    description: "Robe longue en coton avec broderies florales.",
    longDescription:
      "Coton 100% naturel, brodé main. Coupe fluide, ceinture incluse.",
    price: 165000,
    stock: REALISTIC_STOCK(),
    tags: ["robe", "coton", "broderie"],
    colors: [
      { label: "Blanc cassé", hex: "#F5F5DC" },
      { label: "Bleu ciel", hex: "#89CFF0" },
    ],
    sizes: ["S", "M", "L", "XL"],
    categorySlug: "mode-vetements",
    ownerEmail: "tiana.mode@lurevia.mg",
  },
  {
    sku: "MOD-003",
    title: "Chemise en lin naturel",
    description: "Chemise décontractée en lin lavé.",
    longDescription: "Lin naturel respirant, idéal pour les climats chauds.",
    price: 135000,
    stock: REALISTIC_STOCK(),
    tags: ["chemise", "lin", "homme"],
    colors: [
      { label: "Écru", hex: "#F5F5DC" },
      { label: "Bleu pâle", hex: "#B0C4DE" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    categorySlug: "mode-vetements",
    ownerEmail: "tiana.mode@lurevia.mg",
  },
  {
    sku: "MOD-004",
    title: "Sarouel en coton brodé",
    description: "Pantalon large et confortable, style bohème.",
    longDescription: "Coton léger, taille élastique, broderies aux chevilles.",
    price: 95000,
    originalPrice: 115000,
    stock: REALISTIC_STOCK(),
    tags: ["sarouel", "pantalon", "bohème"],
    colors: [
      { label: "Bleu indigo", hex: "#4B0082" },
      { label: "Marron", hex: "#8B4513" },
    ],
    sizes: ["Taille unique"],
    categorySlug: "mode-vetements",
    ownerEmail: "tiana.mode@lurevia.mg",
  },
  {
    sku: "MOD-005",
    title: "Foulard en soie imprimé",
    description: "Foulard carré en soie aux motifs malgaches.",
    longDescription:
      "Soie imprimée avec des motifs inspirés de la faune et flore locales.",
    price: 78000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["foulard", "soie", "accessoire"],
    categorySlug: "mode-vetements",
    ownerEmail: "tiana.mode@lurevia.mg",
  },
  {
    sku: "MOD-006",
    title: "Écharpe en laine des Hauts Plateaux",
    description: "Écharpe chaude et douce tissée localement.",
    longDescription:
      "Laine des Hauts Plateaux, tissage serré. Idéale pour les soirées fraîches.",
    price: 68000,
    stock: REALISTIC_STOCK(),
    tags: ["écharpe", "laine", "chaud"],
    colors: [
      { label: "Bordeaux", hex: "#722F37" },
      { label: "Chocolat", hex: "#3E2723" },
    ],
    categorySlug: "mode-vetements",
    ownerEmail: "tiana.mode@lurevia.mg",
  },
  {
    sku: "MOD-007",
    title: "T-shirt en coton bio sérigraphié",
    description: "T-shirt unisexe en coton biologique, motif lémurien.",
    longDescription:
      "Coton bio certifié, sérigraphie écologique. Coupe droite unisexe.",
    price: 45000,
    stock: REALISTIC_STOCK(),
    tags: ["tshirt", "coton bio", "unisexe"],
    colors: [
      { label: "Blanc", hex: "#FFFFFF" },
      { label: "Noir", hex: "#000000" },
      { label: "Gris", hex: "#808080" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    categorySlug: "mode-vetements",
    ownerEmail: "tiana.mode@lurevia.mg",
  },
  {
    sku: "MOD-008",
    title: "Blouse en tissu traditionnel",
    description: "Blouse brodée en tissu local aux couleurs vives.",
    longDescription:
      "Tissu traditionnel malgache, broderies faites main. Coupe ajustée.",
    price: 105000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["blouse", "traditionnel", "femme"],
    colors: [
      { label: "Jaune safran", hex: "#F4C430" },
      { label: "Rouge", hex: "#C41E3A" },
    ],
    sizes: ["S", "M", "L"],
    categorySlug: "mode-vetements",
    ownerEmail: "tiana.mode@lurevia.mg",
  },

  // ─── Enfants (2) ───
  {
    sku: "ENF-001",
    title: "Doudou en coton bio",
    description: "Doudou tout doux en coton biologique.",
    longDescription:
      "Coton bio certifié GOTS. Rembourrage hypoallergénique. Lavable 30°C.",
    price: 32000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["doudou", "bébé", "bio"],
    colors: [
      { label: "Rose", hex: "#F8BBD0" },
      { label: "Bleu", hex: "#BBDEFB" },
    ],
    categorySlug: "enfants-bebe",
    ownerEmail: "tiana.mode@lurevia.mg",
  },
  {
    sku: "ENF-002",
    title: "Ensemble naissance 3 pièces",
    description: "Ensemble body + pyjama + bonnet en coton bio.",
    longDescription:
      "Trio en coton bio pour les premiers jours. Broderie prénom possible.",
    price: 85000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["ensemble", "naissance", "cadeau"],
    colors: [
      { label: "Blanc", hex: "#FFFFFF" },
      { label: "Bleu poudré", hex: "#B0C4DE" },
      { label: "Rose poudré", hex: "#F4C2C2" },
    ],
    sizes: ["Naissance", "1 mois", "3 mois"],
    categorySlug: "enfants-bebe",
    ownerEmail: "tiana.mode@lurevia.mg",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDEUR 4 : HERY ÉPICERIE — Épicerie (10 produits)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    sku: "EPI-001",
    title: "Vanille de Madagascar — 10 gousses",
    description: "Vanille Bourbon grade A, gousses charnues et parfumées.",
    longDescription:
      "Vanille Bourbon de la région SAVA. Gousses de 18-20 cm, taux de vanilline élevé.",
    price: 60000,
    originalPrice: 75000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["vanille", "épice", "premium"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-002",
    title: "Miel de fleurs sauvages",
    description: "Miel brut non pasteurisé, toutes fleurs.",
    longDescription:
      "Récolté dans les Hautes Terres. Texture crémeuse, goût floral intense.",
    price: 32000,
    stock: REALISTIC_STOCK(),
    tags: ["miel", "naturel", "sauvage"],
    sizes: ["250 g", "500 g", "1 kg"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-003",
    title: "Chocolat noir 70% Madagascar",
    description: "Tablette de chocolat noir pur origine Madagascar.",
    longDescription:
      "Cacao criollo des plantations de la côte Est. Notes fruitées et acidulées.",
    price: 22000,
    stock: REALISTIC_STOCK(),
    tags: ["chocolat", "noir", "cacao"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-004",
    title: "Confiture de goyave artisanale",
    description: "Confiture cuite au chaudron, sans conservateur.",
    longDescription:
      "Goyaves fraîches de saison, sucre de canne. Cuisson traditionnelle.",
    price: 18000,
    stock: REALISTIC_STOCK(),
    tags: ["confiture", "goyave", "artisanal"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-005",
    title: "Poivre noir sauvage de Madagascar",
    description: "Poivre noir sauvage aux arômes puissants.",
    longDescription:
      "Poivre sauvage cueilli à la main dans les forêts de l'Est. Séchage naturel.",
    price: 25000,
    stock: REALISTIC_STOCK(),
    tags: ["poivre", "épice", "sauvage"],
    sizes: ["50 g", "100 g"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-006",
    title: "Clous de girofle sélectionnés",
    description: "Clous de girofle parfumés de la côte Est.",
    longDescription:
      "Boutons floraux séchés au soleil. Saveur intense et longue en bouche.",
    price: 15000,
    stock: REALISTIC_STOCK(),
    tags: ["girofle", "épice"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-007",
    title: "Cannelle en bâtons de Ceylan",
    description: "Cannelle douce en bâtons fins et parfumés.",
    longDescription:
      "Véritable cannelle de Ceylan (Cinnamomum verum), douce et sucrée.",
    price: 18000,
    stock: REALISTIC_STOCK(),
    tags: ["cannelle", "épice", "douce"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-008",
    title: "Gingembre confit au sucre",
    description: "Gingembre frais confit, doux et relevé à la fois.",
    longDescription:
      "Gingembre frais cuit lentement dans un sirop de sucre de canne.",
    price: 16000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["gingembre", "confit", "sucré"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-009",
    title: "Fruit à pain en conserve",
    description: "Fruit à pain prêt à cuisiner, en bocal.",
    longDescription:
      "Fruit à pain cuit et mis en conserve. Idéal pour accompagner viandes et poissons.",
    price: 20000,
    stock: REALISTIC_STOCK(),
    tags: ["fruit à pain", "conserve", "local"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },
  {
    sku: "EPI-010",
    title: "Huile essentielle de girofle",
    description: "Huile essentielle pure, tonifiante et apaisante.",
    longDescription:
      "Distillation à la vapeur d'eau des clous de girofle. Flacon ambré 10 ml.",
    price: 38000,
    originalPrice: 45000,
    stock: REALISTIC_STOCK(),
    tags: ["huile essentielle", "girofle", "aromatherapie"],
    categorySlug: "epicerie-fine",
    ownerEmail: "hery.epicerie@lurevia.mg",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDEUR 5 : NAINA MAISON — Maison (5) + Sacs (5) = 10 produits
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Maison (5) ───
  {
    sku: "MAI-001",
    title: "Nappe brodée main",
    description: "Nappe en coton brodée de motifs traditionnels.",
    longDescription:
      "Coton 100% brodé main. Format 140 × 200 cm, lavable machine 30°C.",
    price: 85000,
    stock: REALISTIC_STOCK(),
    tags: ["nappe", "coton", "brodé"],
    colors: [
      { label: "Blanc", hex: "#FFFFFF" },
      { label: "Écru", hex: "#F5F5DC" },
    ],
    categorySlug: "maison-textile",
    ownerEmail: "naina.maison@lurevia.mg",
  },
  {
    sku: "MAI-002",
    title: "Coussin en soie sauvage",
    description: "Coussin déhoussable en soie sauvage tissée.",
    longDescription:
      "Soie sauvage tissée main. Housse déhoussable avec fermeture zip.",
    price: 65000,
    originalPrice: 80000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["coussin", "soie", "déco"],
    sizes: ["40 × 40 cm", "50 × 50 cm"],
    categorySlug: "maison-textile",
    ownerEmail: "naina.maison@lurevia.mg",
  },
  {
    sku: "MAI-003",
    title: "Couverture en laine des Hauts Plateaux",
    description: "Couverture chaude tissée artisanalement.",
    longDescription:
      "Laine locale tissée sur métiers traditionnels. Dimension 130 × 180 cm.",
    price: 185000,
    stock: REALISTIC_STOCK(),
    tags: ["couverture", "laine", "chaud"],
    colors: [
      { label: "Bordeaux", hex: "#722F37" },
      { label: "Marine", hex: "#000080" },
    ],
    categorySlug: "maison-textile",
    ownerEmail: "naina.maison@lurevia.mg",
  },
  {
    sku: "MAI-004",
    title: "Tapis en raphia naturel",
    description: "Tapis rond en raphia tressé main.",
    longDescription:
      "Raphia tressé serré main. Diamètre 120 cm, épaisseur 1 cm.",
    price: 135000,
    stock: REALISTIC_STOCK(),
    tags: ["tapis", "raphia", "sol"],
    sizes: ["80 cm", "120 cm", "160 cm"],
    categorySlug: "maison-textile",
    ownerEmail: "naina.maison@lurevia.mg",
  },
  {
    sku: "MAI-005",
    title: "Serviettes en lin naturel (×6)",
    description: "Lot de 6 serviettes en lin lavé.",
    longDescription:
      "Lin 100% naturel, ourlets cousus main. Dimension 40 × 40 cm.",
    price: 58000,
    originalPrice: 72000,
    stock: REALISTIC_STOCK(),
    tags: ["serviettes", "lin", "table"],
    categorySlug: "maison-textile",
    ownerEmail: "naina.maison@lurevia.mg",
  },

  // ─── Sacs (5) ───
  {
    sku: "SAC-001",
    title: "Sac cabas en raphia naturel",
    description: "Grand cabas tressé main, parfait pour le quotidien.",
    longDescription:
      "Raphia tressé serré, anses renforcées. Doublure intérieure en coton.",
    price: 95000,
    originalPrice: 120000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["sac", "raphia", "cabas"],
    colors: [
      { label: "Naturel", hex: "#D2B48C" },
      { label: "Noir", hex: "#000000" },
    ],
    categorySlug: "sacs-maroquinerie",
    ownerEmail: "naina.maison@lurevia.mg",
  },
  {
    sku: "SAC-002",
    title: "Pochette en cuir de zébu",
    description: "Pochette élégante en cuir tanné naturellement.",
    longDescription:
      "Cuir de zébu tanné végétal. Fermeture zip dorée. Format 25 × 15 cm.",
    price: 78000,
    stock: REALISTIC_STOCK(),
    isNew: true,
    tags: ["pochette", "cuir", "zébu"],
    colors: [
      { label: "Cognac", hex: "#B87333" },
      { label: "Noir", hex: "#000000" },
    ],
    categorySlug: "sacs-maroquinerie",
    ownerEmail: "naina.maison@lurevia.mg",
  },
  {
    sku: "SAC-003",
    title: "Sac bandoulière en raphia coloré",
    description: "Petit sac bandoulière en raphia teinté.",
    longDescription:
      "Raphia teinté avec pigments naturels. Fermeture bouton aimanté.",
    price: 62000,
    stock: REALISTIC_STOCK(),
    tags: ["sac", "bandoulière", "raphia"],
    colors: [
      { label: "Jaune", hex: "#F4C430" },
      { label: "Rose", hex: "#E75480" },
      { label: "Bleu", hex: "#4169E1" },
    ],
    categorySlug: "sacs-maroquinerie",
    ownerEmail: "naina.maison@lurevia.mg",
  },
  {
    sku: "SAC-004",
    title: "Portefeuille en cuir tressé",
    description: "Portefeuille compact en cuir tressé main.",
    longDescription:
      "Cuir de vachette tressé main. 8 emplacements cartes, 2 compartiments billets.",
    price: 68000,
    originalPrice: 85000,
    stock: REALISTIC_STOCK(),
    tags: ["portefeuille", "cuir", "tressé"],
    categorySlug: "sacs-maroquinerie",
    ownerEmail: "naina.maison@lurevia.mg",
  },
  {
    sku: "SAC-005",
    title: "Sac banane artisanal",
    description: "Sac banane en raphia et coton, tendance et pratique.",
    longDescription:
      "Raphia tressé + sangle coton ajustable. Porté taille ou épaule.",
    price: 52000,
    originalPrice: 65000,
    stock: REALISTIC_STOCK(),
    tags: ["sac banane", "raphia", "tendance"],
    colors: [
      { label: "Naturel", hex: "#D2B48C" },
      { label: "Noir", hex: "#000000" },
    ],
    categorySlug: "sacs-maroquinerie",
    ownerEmail: "naina.maison@lurevia.mg",
  },
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

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      isPrimaryAdmin: true,
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
      isPrimaryAdmin: true,
      emailVerified: true,
      phoneVerified: true,
      isVerified: true,
    },
  });

  console.log(`   ✅ Admin : ${adminEmail}`);
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. VENDEURS (5) avec CIN, contrat et boutique vérifiés
// ═════════════════════════════════════════════════════════════════════════════

async function seedSellers(adminId: string) {
  const sellersToSeed = SEED_DEMO_DATA ? SELLERS : SELLER_TEMPLATES;
  console.log(`\n🏪 ${sellersToSeed.length} vendeurs vérifiés…`);
  const passwordHash = await hashPassword(SELLER_TEMPLATES[0].password);
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));

  for (const s of sellersToSeed) {
    const storeCategoryId = categoryIds.get(s.storeCategorySlug);
    if (!storeCategoryId) throw new Error(`Catégorie introuvable : ${s.storeCategorySlug}`);

    const seller = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        role: Role.SELLER,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        isPrimaryAdmin: false,
        storeCategoryId,
      },
      create: {
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        passwordHash,
        primaryIdentifier: AuthIdentifier.EMAIL,
        primaryProvider: AuthProvider.LOCAL,
        role: Role.SELLER,
        emailVerified: true,
        phoneVerified: true,
        isVerified: true,
        isPrimaryAdmin: false,
        storeCategoryId,
        publicStoreName: s.storeName,
        publicStoreDescription: s.storeDescription,
        publicStoreLogoUrl: sellerLogo(s.email),
        cinNumber: s.cinNumber,
        cinVerifiedAt: new Date(),
        identityDocumentType: IdentityDocumentType.CIN,
        identityDocumentNumber: s.cinNumber,
        identityVerifiedAt: new Date(),
        identityVerificationStatus: IdentityVerificationStatus.APPROVED,
      },
    });

    // Demande de vérification CIN approuvée
    const existingVerification = await prisma.identityVerification.findFirst({
      where: { userId: seller.id },
    });
    if (!existingVerification) {
      await prisma.identityVerification.create({
        data: {
          userId: seller.id,
          status: IdentityVerificationStatus.APPROVED,
          documentType: IdentityDocumentType.CIN,
          documentNumber: s.cinNumber,
          documentUrl: `https://picsum.photos/seed/cin-${seller.id.slice(0, 8)}-front/800/500`,
          documentUrlBack: `https://picsum.photos/seed/cin-${seller.id.slice(0, 8)}-back/800/500`,
          cinNumber: s.cinNumber,
          submittedAt: new Date(),
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      });
    }

    // Contrat vendeur approuvé
    const existingContract = await prisma.sellerContract.findFirst({
      where: { sellerId: seller.id },
    });
    if (!existingContract) {
      await prisma.sellerContract.create({
        data: {
          sellerId: seller.id,
          version: 1,
          type: s.contractType,
          value: s.contractValue,
          currency: "MGA",
          status: SellerContractStatus.APPROVED,
          effectiveFrom: new Date(),
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    }

    console.log(`   ✅ Vendeur : ${s.storeName} (${s.email})`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. CATÉGORIES
// ═════════════════════════════════════════════════════════════════════════════

async function seedCategories() {
  console.log("\n📁 Catégories…");

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
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
    console.log(`   ✅ ${category.name}`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. PRODUITS (50) répartis par catégorie et par vendeur
// ═════════════════════════════════════════════════════════════════════════════

async function seedProducts() {
  console.log("\n📦 Produits…\n");

  // Chaque produit suit la catégorie de la boutique de son vendeur.
  const users = await prisma.user.findMany({
    where: { email: { in: SELLERS.map((s) => s.email) } },
    select: { id: true, email: true, storeCategoryId: true },
  });
  const userMap = new Map(users.map((user) => [user.email, user]));

  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    const owner = userMap.get(p.ownerEmail);
    const ownerId = owner?.id;
    const categoryId = owner?.storeCategoryId;

    if (!ownerId || !categoryId) {
      console.warn(
        `   ⚠️  SKU ${p.sku} : owner ou catégorie introuvable`
      );
      continue;
    }

    const existing = await prisma.product.findUnique({
      where: { sku: p.sku },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.product.create({
      data: {
        ownerId,
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
          create: [{ categoryId }],
        },
      },
    });

    created += 1;
  }

  if (SEED_DEMO_DATA) {
    for (const [sellerIndex, seller] of SELLERS.entries()) {
      const owner = userMap.get(seller.email);
      if (!owner?.storeCategoryId || sellerIndex < SELLER_TEMPLATES.length) continue;

      for (let productIndex = 1; productIndex <= 2; productIndex += 1) {
        const sku = `DEMO-${String(sellerIndex + 1).padStart(3, "0")}-${productIndex}`;
        const title = `${seller.storeName} — Création ${productIndex}`;
        const existing = await prisma.product.findUnique({ where: { sku } });
        if (existing) {
          skipped += 1;
          continue;
        }
        await prisma.product.create({
          data: {
            ownerId: owner.id,
            title,
            slug: slugify(title),
            sku,
            description: `Création artisanale proposée par ${seller.storeName}.`,
            longDescription: seller.storeDescription,
            price: 20_000 + ((sellerIndex * 7_919 + productIndex * 3_107) % 280_000),
            stock: REALISTIC_STOCK(),
            isActive: true,
            isNew: productIndex === 1,
            tags: [seller.storeCategorySlug, "fabrication locale"],
            ratingCache: REALISTIC_RATING(),
            reviewCountCache: REALISTIC_REVIEWS(),
            images: {
              create: productImages(sku, 3).map((url, position) => ({ url, position })),
            },
            categories: { create: [{ categoryId: owner.storeCategoryId }] },
          },
        });
        created += 1;
      }
    }
  }

  console.log(
    `\n   📊 ${created} produits créés, ${skipped} déjà présents.`
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("🚀 Démarrage du seed Lurevia…\n");
  const start = Date.now();

  await seedPlatformSettings();
  await seedAdmin();
  if (process.env.NODE_ENV === "production") {
    console.log("Seed de démonstration désactivé en production.");
    return;
  }
  await seedCategories();
  const admin = await prisma.user.findUniqueOrThrow({
    where: {
      email: (
        process.env.INITIAL_ADMIN_EMAIL || "admin@lurevia.mg"
      ).toLowerCase(),
    },
    select: { id: true },
  });
  await seedSellers(admin.id);
  await seedProducts();
  if (SEED_DEMO_DATA) await seedDemoData(prisma);

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n🌱 Seed terminé avec succès en ${duration}s.\n`);
  console.log("👤 Comptes de connexion :");
  console.log(
    `   Admin   : ${process.env.INITIAL_ADMIN_EMAIL || "admin@lurevia.mg"} / ${process.env.INITIAL_ADMIN_PASSWORD || "Admin12345!"}`
  );
  console.log("\n   Vendeurs de démonstration (mot de passe commun : Seller1234!) :");
  for (const s of SELLER_TEMPLATES) {
    console.log(`   - ${s.storeName.padEnd(28)} → ${s.email}`);
  }
  if (SEED_DEMO_DATA) {
    console.log("   - 95 comptes vendeurs supplémentaires : demo.vendeur.006 à demo.vendeur.100@lurevia.mg");
    console.log("   - Comptes clients : demo.client.00001 à demo.client.10000@lurevia.test");
  }
  console.log(
    "\n💡 Inscris-toi comme client via POST /api/v1/auth/oauth/callback (Google)\n"
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