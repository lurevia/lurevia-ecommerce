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

/** Images produit déterministes via picsum.photos (seed = SKU). */
function productImages(sku: string, count = 3): string[] {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/${sku.toLowerCase()}-${i}/800/800`
  );
}

/** Image catégorie (carré) et bannière (panoramique). */
function categoryImage(slug: string, kind: "card" | "banner"): string {
  const dims = kind === "card" ? "600/600" : "1600/400";
  return `https://picsum.photos/seed/cat-${slug}-${kind}/${dims}`;
}

const REALISTIC_STOCK = () => Math.floor(Math.random() * 40) + 5;
const REALISTIC_RATING = () => 4 + Math.random();
const REALISTIC_REVIEWS = () => Math.floor(Math.random() * 80) + 3;

// ═════════════════════════════════════════════════════════════════════════════
// DONNÉES : 10 CATÉGORIES × 10 PRODUITS
// ═════════════════════════════════════════════════════════════════════════════

const CATEGORIES: SeedCategory[] = [
  // ══════════════ 1. ARTISANAT & DÉCORATION ══════════════
  {
    slug: "artisanat-decoration",
    name: "Artisanat & Décoration",
    description: "Pièces uniques façonnées à la main par les artisans malgaches.",
    iconName: "Palette",
    position: 1,
    products: [
      {
        sku: "ART-001",
        title: "Panier tressé en raphia naturel",
        description: "Grand panier tressé main, idéal pour le rangement ou la déco.",
        longDescription: "Tressé à la main par nos artisans de la région Analamanga. Chaque panier est unique et reflète un savoir-faire transmis de génération en génération.",
        price: 45000, originalPrice: 55000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["raphia", "panier", "artisanat", "décoration"],
        colors: [{ label: "Naturel", hex: "#D2B48C" }, { label: "Écru", hex: "#F5F5DC" }],
        sizes: ["M", "L", "XL"],
      },
      {
        sku: "ART-002",
        title: "Vase en terre cuite sculpté",
        description: "Vase élégant en terre cuite, parfait pour vos plantes séchées.",
        longDescription: "Façonné et sculpté à la main. La terre cuite utilisée provient des collines d'Antananarivo.",
        price: 35000, stock: REALISTIC_STOCK(),
        tags: ["vase", "terre cuite", "décoration"],
        colors: [{ label: "Terracotta", hex: "#C86A3E" }, { label: "Argile", hex: "#B08D57" }],
        sizes: ["20 cm", "30 cm"],
      },
      {
        sku: "ART-003",
        title: "Statuette en bois de palissandre",
        description: "Statuette sculptée représentant un zébu, symbole malgache.",
        longDescription: "Palissandre massif sculpté main. Pièce de collection pour amateurs d'art africain.",
        price: 180000, originalPrice: 220000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["bois", "sculpture", "palissandre", "art"],
      },
      {
        sku: "ART-004",
        title: "Tableau en sable coloré",
        description: "Œuvre d'art en sable naturel coloré, format 30 × 40 cm.",
        longDescription: "Technique traditionnelle du sable coloré. Encadré sous verre, prêt à suspendre.",
        price: 120000, stock: REALISTIC_STOCK(),
        tags: ["tableau", "sable", "art", "décoration"],
      },
      {
        sku: "ART-005",
        title: "Coffret sculpté en bois précieux",
        description: "Boîte à trésors décorée de motifs traditionnels.",
        longDescription: "Bois de rose sculpté à la main, intérieur feutré. Idéal pour bijoux ou souvenirs.",
        price: 95000, stock: REALISTIC_STOCK(),
        tags: ["coffret", "bois", "bijoux", "artisanat"],
      },
      {
        sku: "ART-006",
        title: "Boîte à bijoux en bois de rose",
        description: "Élégant écrin avec compartiments et miroir intérieur.",
        longDescription: "Finition vernie brillante. Compartiments ajustables pour bagues, colliers et bracelets.",
        price: 135000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["boîte", "bijoux", "bois de rose", "cadeau"],
      },
      {
        sku: "ART-007",
        title: "Photophore en bambou tressé",
        description: "Photophore naturel qui diffuse une lumière chaleureuse.",
        longDescription: "Bambou tressé main. Compatible bougies chauffe-plat et LED.",
        price: 28000, stock: REALISTIC_STOCK(),
        tags: ["photophore", "bambou", "lumière", "déco"],
        sizes: ["Petit", "Moyen"],
      },
      {
        sku: "ART-008",
        title: "Lampe en raphia suspendue",
        description: "Suspension artisanale en raphia, ambiance naturelle et douce.",
        longDescription: "Abat-jour en raphia tissé. Câble électrique conforme aux normes, ampoule E27 non fournie.",
        price: 165000, originalPrice: 195000, stock: REALISTIC_STOCK(),
        tags: ["lampe", "raphia", "suspension", "décoration"],
      },
      {
        sku: "ART-009",
        title: "Coupelle décorative en pierre",
        description: "Coupelle en pierre polie pour bijoux ou petits objets.",
        longDescription: "Pierre naturelle extraite et polie à la main. Chaque pièce a ses nuances propres.",
        price: 42000, stock: REALISTIC_STOCK(),
        tags: ["coupelle", "pierre", "décoration"],
      },
      {
        sku: "ART-010",
        title: "Cadre photo sculpté",
        description: "Cadre en bois sculpté avec motifs géométriques traditionnels.",
        longDescription: "Bois massif sculpté main. Compatible photo 10 × 15 cm.",
        price: 38000, stock: REALISTIC_STOCK(),
        tags: ["cadre", "photo", "bois", "sculpture"],
        colors: [{ label: "Naturel", hex: "#8B5A2B" }, { label: "Foncé", hex: "#3B2417" }],
      },
    ],
  },

  // ══════════════ 2. BIJOUX & ACCESSOIRES ══════════════
  {
    slug: "bijoux-accessoires",
    name: "Bijoux & Accessoires",
    description: "Bijoux artisanaux en pierres, corne et métaux précieux.",
    iconName: "Gem",
    position: 2,
    products: [
      {
        sku: "BIJ-001",
        title: "Collier en perles de pierres naturelles",
        description: "Collier élégant en pierres semi-précieuses malgaches.",
        longDescription: "Perles de pierres naturelles (jaspe, agate, quartz) montées sur fil de soie.",
        price: 85000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["collier", "perles", "pierres", "bijoux"],
      },
      {
        sku: "BIJ-002",
        title: "Bracelet en corne de zébu",
        description: "Bracelet manchette en corne polie, design contemporain.",
        longDescription: "Corne de zébu travaillée et polie à la main. Pièce unique, écologique et élégante.",
        price: 65000, originalPrice: 80000, stock: REALISTIC_STOCK(),
        tags: ["bracelet", "corne", "zébu", "bijoux"],
        colors: [{ label: "Noir", hex: "#1A1A1A" }, { label: "Brun", hex: "#6B4423" }],
        sizes: ["S", "M", "L"],
      },
      {
        sku: "BIJ-003",
        title: "Boucles d'oreilles en argent 925",
        description: "Boucles d'oreilles pendantes en argent massif 925.",
        longDescription: "Argent massif 925, façonnées à la main. Fermoir sécurisé.",
        price: 145000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["boucles", "argent", "bijoux", "luxe"],
      },
      {
        sku: "BIJ-004",
        title: "Bague en pierres semi-précieuses",
        description: "Bague serti d'une pierre de Madagascar.",
        longDescription: "Monture en laiton doré avec pierre naturelle taillée à la main.",
        price: 55000, stock: REALISTIC_STOCK(),
        tags: ["bague", "pierres", "bijoux"],
        sizes: ["50", "52", "54", "56", "58"],
      },
      {
        sku: "BIJ-005",
        title: "Pendentif en raphia tressé",
        description: "Pendentif léger et naturel pour un look bohème.",
        longDescription: "Raphia naturel tressé main. Cordon ajustable en coton bio.",
        price: 22000, stock: REALISTIC_STOCK(),
        tags: ["pendentif", "raphia", "bohème"],
      },
      {
        sku: "BIJ-006",
        title: "Broche émaillée artisanale",
        description: "Broche décorative aux couleurs vives.",
        longDescription: "Émail à froid sur laiton. Motif inspiré de la faune malgache.",
        price: 48000, stock: REALISTIC_STOCK(),
        tags: ["broche", "émail", "bijoux"],
      },
      {
        sku: "BIJ-007",
        title: "Sautoir en graines de Job",
        description: "Long collier en graines naturelles poncées.",
        longDescription: "Graines de larme de Job (Coix lacryma-jobi) sélectionnées et poncées une à une.",
        price: 58000, stock: REALISTIC_STOCK(),
        tags: ["sautoir", "graines", "naturel", "bijoux"],
      },
      {
        sku: "BIJ-008",
        title: "Bracelet manchette en laiton martelé",
        description: "Manchette robuste au style ethnique affirmé.",
        longDescription: "Laiton massif martelé à la main. Largeur 3 cm, ajustable.",
        price: 72000, originalPrice: 90000, stock: REALISTIC_STOCK(),
        tags: ["manchette", "laiton", "bijoux", "ethnique"],
      },
      {
        sku: "BIJ-009",
        title: "Bague sculptée en corne",
        description: "Bague large sculptée dans la corne de zébu.",
        longDescription: "Corne polie, finition mate. Design géométrique gravé main.",
        price: 42000, stock: REALISTIC_STOCK(),
        tags: ["bague", "corne", "bijoux"],
        sizes: ["52", "54", "56", "58", "60"],
      },
      {
        sku: "BIJ-010",
        title: "Épingle à cheveux en corne",
        description: "Épingle décorative pour chignon, style japonais revisité.",
        longDescription: "Corne travaillée et sculptée. Longueur 15 cm.",
        price: 32000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["épingle", "cheveux", "corne", "accessoire"],
      },
    ],
  },

  // ══════════════ 3. MODE & VÊTEMENTS ══════════════
  {
    slug: "mode-vetements",
    name: "Mode & Vêtements",
    description: "Vêtements en coton, soie sauvage et lin naturel.",
    iconName: "Shirt",
    position: 3,
    products: [
      {
        sku: "MOD-001",
        title: "Lamba en soie sauvage",
        description: "Écharpe traditionnelle malgache en soie sauvage.",
        longDescription: "Soie sauvage tissée à la main, teintée avec des pigments naturels. Pièce emblématique de Madagascar.",
        price: 185000, originalPrice: 220000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["lamba", "soie", "traditionnel", "écharpe"],
        colors: [{ label: "Rouge terre", hex: "#B33A3A" }, { label: "Vert forêt", hex: "#2D4A2D" }],
      },
      {
        sku: "MOD-002",
        title: "Robe en coton brodé main",
        description: "Robe longue en coton avec broderies florales.",
        longDescription: "Coton 100% naturel, brodé main. Coupe fluide, ceinture incluse.",
        price: 165000, stock: REALISTIC_STOCK(),
        tags: ["robe", "coton", "broderie", "femme"],
        colors: [{ label: "Blanc cassé", hex: "#F5F5DC" }, { label: "Bleu ciel", hex: "#89CFF0" }],
        sizes: ["S", "M", "L", "XL"],
      },
      {
        sku: "MOD-003",
        title: "Chemise en lin naturel",
        description: "Chemise décontractée en lin lavé.",
        longDescription: "Lin naturel respirant, idéal pour les climats chauds.",
        price: 135000, stock: REALISTIC_STOCK(),
        tags: ["chemise", "lin", "homme", "été"],
        colors: [{ label: "Écru", hex: "#F5F5DC" }, { label: "Bleu pâle", hex: "#B0C4DE" }],
        sizes: ["S", "M", "L", "XL", "XXL"],
      },
      {
        sku: "MOD-004",
        title: "Sarouel en coton brodé",
        description: "Pantalon large et confortable, style bohème.",
        longDescription: "Coton léger, taille élastique, broderies aux chevilles.",
        price: 95000, originalPrice: 115000, stock: REALISTIC_STOCK(),
        tags: ["sarouel", "pantalon", "bohème", "coton"],
        colors: [{ label: "Bleu indigo", hex: "#4B0082" }, { label: "Marron", hex: "#8B4513" }],
        sizes: ["Taille unique"],
      },
      {
        sku: "MOD-005",
        title: "Foulard en soie imprimé",
        description: "Foulard carré en soie aux motifs malgaches.",
        longDescription: "Soie imprimée avec des motifs inspirés de la faune et flore locales.",
        price: 78000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["foulard", "soie", "accessoire", "femme"],
      },
      {
        sku: "MOD-006",
        title: "Écharpe en laine des Hauts plateaux",
        description: "Écharpe chaude et douce tissée localement.",
        longDescription: "Laine des Hauts Plateaux, tissage serré. Idéale pour les soirées fraîches.",
        price: 68000, stock: REALISTIC_STOCK(),
        tags: ["écharpe", "laine", "hiver", "chaud"],
        colors: [{ label: "Bordeaux", hex: "#722F37" }, { label: "Chocolat", hex: "#3E2723" }],
      },
      {
        sku: "MOD-007",
        title: "T-shirt en coton bio sérigraphié",
        description: "T-shirt unisexe en coton biologique, motif lémurien.",
        longDescription: "Coton bio certifié, sérigraphie écologique. Coupe droite unisexe.",
        price: 45000, stock: REALISTIC_STOCK(),
        tags: ["tshirt", "coton bio", "unisexe", "léMurien"],
        colors: [{ label: "Blanc", hex: "#FFFFFF" }, { label: "Noir", hex: "#000000" }, { label: "Gris", hex: "#808080" }],
        sizes: ["S", "M", "L", "XL", "XXL"],
      },
      {
        sku: "MOD-008",
        title: "Jupe longue imprimée",
        description: "Jupe portefeuille longue, légère et colorée.",
        longDescription: "Coton léger à imprimé inspiré des tissus traditionnels. Taille haute.",
        price: 88000, stock: REALISTIC_STOCK(),
        tags: ["jupe", "long", "femme", "imprimé"],
        sizes: ["S", "M", "L", "XL"],
      },
      {
        sku: "MOD-009",
        title: "Veste en jean artisanale",
        description: "Veste en jean brodée main, pièce unique.",
        longDescription: "Jean épais brodé main de motifs géométriques. Coupe droite.",
        price: 195000, originalPrice: 245000, stock: REALISTIC_STOCK(),
        tags: ["veste", "jean", "brodé", "artisanal"],
        sizes: ["S", "M", "L", "XL"],
      },
      {
        sku: "MOD-010",
        title: "Blouse en tissu traditionnel",
        description: "Blouse brodée en tissu local aux couleurs vives.",
        longDescription: "Tissu traditionnel malgache, broderies faites main. Coupe ajustée.",
        price: 105000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["blouse", "traditionnel", "femme", "coloré"],
        colors: [{ label: "Jaune safran", hex: "#F4C430" }, { label: "Rouge", hex: "#C41E3A" }],
        sizes: ["S", "M", "L"],
      },
    ],
  },

  // ══════════════ 4. BEAUTÉ & SOINS ══════════════
  {
    slug: "beaute-soins",
    name: "Beauté & Soins",
    description: "Cosmétiques naturels à base d'ingrédients malgaches.",
    iconName: "Sparkles",
    position: 4,
    products: [
      {
        sku: "BEA-001",
        title: "Huile essentielle de baobab",
        description: "Huile pure pressée à froid, riche en vitamines.",
        longDescription: "Huile de baobab 100% pure, pressée à froid. Nourrit la peau et les cheveux.",
        price: 58000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["huile", "baobab", "naturel", "soin"],
        sizes: ["30 ml", "100 ml"],
      },
      {
        sku: "BEA-002",
        title: "Savon artisanal au miel de Madagascar",
        description: "Savon doux saponifié à froid avec miel local.",
        longDescription: "Saponification à froid, miel de fleurs sauvages. Convient aux peaux sensibles.",
        price: 18000, stock: REALISTIC_STOCK(),
        tags: ["savon", "miel", "artisanal", "bio"],
      },
      {
        sku: "BEA-003",
        title: "Beurre de karité brut",
        description: "Beurre de karité non raffiné, hydratant intense.",
        longDescription: "Karité brut non raffiné, riche en vitamines A et E. Multi-usages.",
        price: 32000, originalPrice: 40000, stock: REALISTIC_STOCK(),
        tags: ["karité", "hydratant", "naturel"],
        sizes: ["100 g", "250 g"],
      },
      {
        sku: "BEA-004",
        title: "Huile de coco vierge bio",
        description: "Huile de coco pressée à froid, usage alimentaire et capillaire.",
        longDescription: "Coco pressée à froid, sans additifs. Peut s'utiliser en cuisine, soin peau et cheveux.",
        price: 28000, stock: REALISTIC_STOCK(),
        tags: ["coco", "bio", "multi-usage"],
      },
      {
        sku: "BEA-005",
        title: "Masque à l'argile verte",
        description: "Masque purifiant à base d'argile naturelle.",
        longDescription: "Argile verte + huiles essentielles. Purifie et resserre les pores.",
        price: 24000, stock: REALISTIC_STOCK(),
        tags: ["masque", "argile", "purifiant"],
      },
      {
        sku: "BEA-006",
        title: "Baume à lèvres au karité",
        description: "Baume hydratant longue durée.",
        longDescription: "Karité + cire d'abeille + huile de baobab. Protège du dessèchement.",
        price: 15000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["baume", "lèvres", "karité"],
      },
      {
        sku: "BEA-007",
        title: "Shampoing solide naturel",
        description: "Shampoing solide sans sulfate, zéro déchet.",
        longDescription: "Shampoing solide aux huiles essentielles. Équivalent à 2 bouteilles de 250 ml.",
        price: 26000, stock: REALISTIC_STOCK(),
        tags: ["shampoing", "solide", "zéro déchet"],
        colors: [{ label: "Naturel", hex: "#F0E68C" }],
      },
      {
        sku: "BEA-008",
        title: "Huile de ricin noire",
        description: "Huile de ricin traditionnelle pour fortifier cheveux et cils.",
        longDescription: "Ricinus communis, pressée à froid. Utilisée depuis des siècles.",
        price: 22000, stock: REALISTIC_STOCK(),
        tags: ["ricin", "cheveux", "fortifiant"],
      },
      {
        sku: "BEA-009",
        title: "Crème hydratante visage",
        description: "Crème de jour légère pour tous types de peaux.",
        longDescription: "Formule à base de karité, coco et vitamine E. Texture non grasse.",
        price: 45000, originalPrice: 55000, stock: REALISTIC_STOCK(),
        tags: ["crème", "visage", "hydratant"],
      },
      {
        sku: "BEA-010",
        title: "Gommage corporel au café",
        description: "Gommage exfoliant au marc de café et sucre de canne.",
        longDescription: "Café moulu + sucre roux + huile de coco. Exfolie et raffermit.",
        price: 30000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["gommage", "café", "exfoliant"],
      },
    ],
  },

  // ══════════════ 5. ÉPICERIE FINE ══════════════
  {
    slug: "epicerie-fine",
    name: "Épicerie fine",
    description: "Vanille, épices, chocolat et produits du terroir malgache.",
    iconName: "Coffee",
    position: 5,
    products: [
      {
        sku: "EPI-001",
        title: "Vanille de Madagascar — 10 gousses",
        description: "Vanille Bourbon grade A, gousses charnues et parfumées.",
        longDescription: "Vanille Bourbon de la région SAVA. Gousses de 18-20 cm, taux de vanilline élevé.",
        price: 60000, originalPrice: 75000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["vanille", "épice", "madagascar", "premium"],
      },
      {
        sku: "EPI-002",
        title: "Miel de fleurs sauvages",
        description: "Miel brut non pasteurisé, toutes fleurs.",
        longDescription: "Récolté dans les Hautes Terres. Texture crémeuse, goût floral intense.",
        price: 32000, stock: REALISTIC_STOCK(),
        tags: ["miel", "naturel", "sauvage"],
        sizes: ["250 g", "500 g", "1 kg"],
      },
      {
        sku: "EPI-003",
        title: "Chocolat noir 70% Madagascar",
        description: "Tablette de chocolat noir pur origine Madagascar.",
        longDescription: "Cacao criollo des plantations de la côte Est. Notes fruitées et acidulées.",
        price: 22000, stock: REALISTIC_STOCK(),
        tags: ["chocolat", "noir", "cacao"],
      },
      {
        sku: "EPI-004",
        title: "Confiture de goyave artisanale",
        description: "Confiture cuite au chaudron, sans conservateur.",
        longDescription: "Goyaves fraîches de saison, sucre de canne. Cuisson traditionnelle.",
        price: 18000, stock: REALISTIC_STOCK(),
        tags: ["confiture", "goyave", "artisanal"],
      },
      {
        sku: "EPI-005",
        title: "Poivre noir sauvage de Madagascar",
        description: "Poivre noir sauvage aux arômes puissants.",
        longDescription: "Poivre sauvage cueilli à la main dans les forêts de l'Est. Séchage naturel.",
        price: 25000, stock: REALISTIC_STOCK(),
        tags: ["poivre", "épice", "sauvage"],
        sizes: ["50 g", "100 g"],
      },
      {
        sku: "EPI-006",
        title: "Clous de girofle sélectionnés",
        description: "Clous de girofle parfumés de la côte Est.",
        longDescription: "Boutons floraux séchés au soleil. Saveur intense et longue en bouche.",
        price: 15000, stock: REALISTIC_STOCK(),
        tags: ["girofle", "épice"],
      },
      {
        sku: "EPI-007",
        title: "Cannelle en bâtons de Ceylan",
        description: "Cannelle douce en bâtons fins et parfumés.",
        longDescription: "Véritable cannelle de Ceylan (Cinnamomum verum), douce et sucrée.",
        price: 18000, stock: REALISTIC_STOCK(),
        tags: ["cannelle", "épice", "douce"],
      },
      {
        sku: "EPI-008",
        title: "Gingembre confit au sucre",
        description: "Gingembre frais confit, doux et relevé à la fois.",
        longDescription: "Gingembre frais cuit lentement dans un sirop de sucre de canne.",
        price: 16000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["gingembre", "confit", "sucré"],
      },
      {
        sku: "EPI-009",
        title: "Fruit à pain en conserve",
        description: "Fruit à pain prêt à cuisiner, en bocal.",
        longDescription: "Fruit à pain cuit et mis en conserve. Idéal pour accompagner viandes et poissons.",
        price: 20000, stock: REALISTIC_STOCK(),
        tags: ["fruit à pain", "conserve", "local"],
      },
      {
        sku: "EPI-010",
        title: "Huile essentielle de girofle",
        description: "Huile essentielle pure, tonifiante et apaisante.",
        longDescription: "Distillation à la vapeur d'eau des clous de girofle. Flacon ambré 10 ml.",
        price: 38000, originalPrice: 45000, stock: REALISTIC_STOCK(),
        tags: ["huile essentielle", "girofle", "aromatherapie"],
      },
    ],
  },

  // ══════════════ 6. SACS & MAROQUINERIE ══════════════
  {
    slug: "sacs-maroquinerie",
    name: "Sacs & Maroquinerie",
    description: "Sacs en raphia, cuir et toile, faits main à Madagascar.",
    iconName: "ShoppingBag",
    position: 6,
    products: [
      {
        sku: "SAC-001",
        title: "Sac cabas en raphia naturel",
        description: "Grand cabas tressé main, parfait pour le quotidien.",
        longDescription: "Raphia tressé serré, anses renforcées. Doublure intérieure en coton.",
        price: 95000, originalPrice: 120000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["sac", "raphia", "cabas", "femme"],
        colors: [{ label: "Naturel", hex: "#D2B48C" }, { label: "Noir", hex: "#000000" }],
      },
      {
        sku: "SAC-002",
        title: "Sac à dos en toile cirée",
        description: "Sac à dos robuste en toile enduite.",
        longDescription: "Toile cirée imperméable, fermeture zip. Compartiment ordinateur 15\".",
        price: 145000, stock: REALISTIC_STOCK(),
        tags: ["sac à dos", "toile", "robuste"],
        colors: [{ label: "Kaki", hex: "#4B5320" }, { label: "Noir", hex: "#000000" }],
      },
      {
        sku: "SAC-003",
        title: "Pochette en cuir de zébu",
        description: "Pochette élégante en cuir tanné naturellement.",
        longDescription: "Cuir de zébu tanné végétal. Fermeture zip dorée. Format 25 × 15 cm.",
        price: 78000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["pochette", "cuir", "zébu", "soirée"],
        colors: [{ label: "Cognac", hex: "#B87333" }, { label: "Noir", hex: "#000000" }],
      },
      {
        sku: "SAC-004",
        title: "Sac bandoulière en raphia coloré",
        description: "Petit sac bandoulière en raphia teinté.",
        longDescription: "Raphia teinté avec pigments naturels. Fermeture bouton aimanté.",
        price: 62000, stock: REALISTIC_STOCK(),
        tags: ["sac", "bandoulière", "raphia", "coloré"],
        colors: [{ label: "Jaune", hex: "#F4C430" }, { label: "Rose", hex: "#E75480" }, { label: "Bleu", hex: "#4169E1" }],
      },
      {
        sku: "SAC-005",
        title: "Portefeuille en cuir tressé",
        description: "Portefeuille compact en cuir tressé main.",
        longDescription: "Cuir de vachette tressé main. 8 emplacements cartes, 2 compartiments billets.",
        price: 68000, originalPrice: 85000, stock: REALISTIC_STOCK(),
        tags: ["portefeuille", "cuir", "tressé"],
      },
      {
        sku: "SAC-006",
        title: "Sac à main en jute brodé",
        description: "Sac à main en jute naturelle brodée main.",
        longDescription: "Jute tissée et brodée avec fils de coton colorés. Anses en cuir.",
        price: 85000, stock: REALISTIC_STOCK(),
        tags: ["sac à main", "jute", "brodé", "éco"],
      },
      {
        sku: "SAC-007",
        title: "Ceinture en cuir tressé",
        description: "Ceinture élégante en cuir tressé main.",
        longDescription: "Cuir pleine fleur tressé main. Boucle en laiton massif.",
        price: 55000, stock: REALISTIC_STOCK(),
        tags: ["ceinture", "cuir", "tressé"],
        colors: [{ label: "Marron", hex: "#8B4513" }, { label: "Noir", hex: "#000000" }],
        sizes: ["80 cm", "85 cm", "90 cm", "95 cm", "100 cm"],
      },
      {
        sku: "SAC-008",
        title: "Sac de plage en coton imprimé",
        description: "Grand sac de plage léger et coloré.",
        longDescription: "Coton imprimé résistant à l'eau. Anses larges pour porter à l'épaule.",
        price: 48000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["sac", "plage", "coton", "été"],
      },
      {
        sku: "SAC-009",
        title: "Trousse de toilette en cuir",
        description: "Trousse spacieuse pour vos essentiels de voyage.",
        longDescription: "Cuir imperméabilisé, doublure lavable. Format 25 × 15 × 10 cm.",
        price: 72000, stock: REALISTIC_STOCK(),
        tags: ["trousse", "toilette", "cuir", "voyage"],
      },
      {
        sku: "SAC-010",
        title: "Sac banane artisanal",
        description: "Sac banane en raphia et coton, tendance et pratique.",
        longDescription: "Raphia tressé + sangle coton ajustable. Porté taille ou épaule.",
        price: 52000, originalPrice: 65000, stock: REALISTIC_STOCK(),
        tags: ["sac banane", "raphia", "tendance"],
        colors: [{ label: "Naturel", hex: "#D2B48C" }, { label: "Noir", hex: "#000000" }],
      },
    ],
  },

  // ══════════════ 7. MAISON & TEXTILE ══════════════
  {
    slug: "maison-textile",
    name: "Maison & Textile",
    description: "Linge de maison en coton, soie sauvage et raphia.",
    iconName: "Home",
    position: 7,
    products: [
      {
        sku: "MAI-001",
        title: "Nappe brodée main",
        description: "Nappe en coton brodée de motifs traditionnels.",
        longDescription: "Coton 100% brodé main. Format 140 × 200 cm, lavable machine 30°C.",
        price: 85000, stock: REALISTIC_STOCK(),
        tags: ["nappe", "coton", "brodé", "table"],
        colors: [{ label: "Blanc", hex: "#FFFFFF" }, { label: "Écru", hex: "#F5F5DC" }],
      },
      {
        sku: "MAI-002",
        title: "Coussin en soie sauvage",
        description: "Coussin déhoussable en soie sauvage tissée.",
        longDescription: "Soie sauvage tissée main. Housse déhoussable avec fermeture zip.",
        price: 65000, originalPrice: 80000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["coussin", "soie", "déco", "salon"],
        sizes: ["40 × 40 cm", "50 × 50 cm"],
      },
      {
        sku: "MAI-003",
        title: "Couverture en laine des Hauts Plateaux",
        description: "Couverture chaude tissée artisanalement.",
        longDescription: "Laine locale tissée sur métiers traditionnels. Dimension 130 × 180 cm.",
        price: 185000, stock: REALISTIC_STOCK(),
        tags: ["couverture", "laine", "chaud"],
        colors: [{ label: "Bordeaux", hex: "#722F37" }, { label: "Marine", hex: "#000080" }],
      },
      {
        sku: "MAI-004",
        title: "Rideau en coton brodé",
        description: "Rideau léger avec broderies en bas.",
        longDescription: "Coton naturel, broderies artisanales. Œillets métalliques inclus.",
        price: 95000, stock: REALISTIC_STOCK(),
        sizes: ["120 × 180 cm", "140 × 240 cm"],
      },
      {
        sku: "MAI-005",
        title: "Tapis en raphia naturel",
        description: "Tapis rond en raphia tressé main.",
        longDescription: "Raphia tressé serré main. Diamètre 120 cm, épaisseur 1 cm.",
        price: 135000, stock: REALISTIC_STOCK(),
        tags: ["tapis", "raphia", "sol"],
        sizes: ["80 cm", "120 cm", "160 cm"],
      },
      {
        sku: "MAI-006",
        title: "Set de table brodé (×4)",
        description: "Lot de 4 sets de table brodés main.",
        longDescription: "Coton brodé main, motif traditionnel. Lavables en machine.",
        price: 42000, stock: REALISTIC_STOCK(),
        tags: ["set de table", "brodé", "coton"],
      },
      {
        sku: "MAI-007",
        title: "Serviettes en lin naturel (×6)",
        description: "Lot de 6 serviettes en lin lavé.",
        longDescription: "Lin 100% naturel, ourlets cousus main. Dimension 40 × 40 cm.",
        price: 58000, originalPrice: 72000, stock: REALISTIC_STOCK(),
        tags: ["serviettes", "lin", "table"],
      },
      {
        sku: "MAI-008",
        title: "Plaid en laine polaire",
        description: "Plaid doux et chaud pour soirées fraîches.",
        longDescription: "Laine polaire, toucher velours. Dimensions 150 × 200 cm.",
        price: 125000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["plaid", "laine", "chaud", "canapé"],
        colors: [{ label: "Gris chiné", hex: "#808080" }, { label: "Beige", hex: "#F5F5DC" }],
      },
      {
        sku: "MAI-009",
        title: "Parure de lit brodée",
        description: "Parure complète : housse + 2 taies brodées.",
        longDescription: "Coton brodé main. Housse 240 × 260 cm, taies 65 × 65 cm.",
        price: 245000, stock: REALISTIC_STOCK(),
        tags: ["parure", "lit", "coton", "brodé"],
        sizes: ["2 places"],
      },
      {
        sku: "MAI-010",
        title: "Chemin de table brodé",
        description: "Chemin de table élégant, longueur 180 cm.",
        longDescription: "Coton brodé main aux fils dorés. Finition ourlet.",
        price: 38000, stock: REALISTIC_STOCK(),
        tags: ["chemin de table", "brodé", "décoration"],
      },
    ],
  },

  // ══════════════ 8. ENFANTS & BÉBÉ ══════════════
  {
    slug: "enfants-bebe",
    name: "Enfants & Bébé",
    description: "Vêtements et accessoires pour enfants en matières douces.",
    iconName: "Baby",
    position: 8,
    products: [
      {
        sku: "ENF-001",
        title: "Doudou en coton bio",
        description: "Doudou tout doux en coton biologique.",
        longDescription: "Coton bio certifié GOTS. Rembourrage hypoallergénique. Lavable 30°C.",
        price: 32000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["doudou", "bébé", "bio"],
        colors: [{ label: "Rose", hex: "#F8BBD0" }, { label: "Bleu", hex: "#BBDEFB" }],
      },
      {
        sku: "ENF-002",
        title: "Body brodé main",
        description: "Body en coton avec broderie artisanale.",
        longDescription: "Coton doux, broderie main. Boutons pression pratiques.",
        price: 28000, stock: REALISTIC_STOCK(),
        tags: ["body", "bébé", "brodé"],
        sizes: ["0-3 mois", "3-6 mois", "6-12 mois"],
      },
      {
        sku: "ENF-003",
        title: "Petit sac à dos enfant",
        description: "Sac à dos coloré pour les tout-petits.",
        longDescription: "Toile résistante, bretelles ajustables. Format 30 × 25 cm.",
        price: 45000, stock: REALISTIC_STOCK(),
        tags: ["sac à dos", "enfant", "école"],
        colors: [{ label: "Rouge", hex: "#C41E3A" }, { label: "Bleu", hex: "#1E90FF" }],
      },
      {
        sku: "ENF-004",
        title: "Couverture bébé en coton",
        description: "Couverture douce 80 × 100 cm.",
        longDescription: "Coton bio, bordure satin. Idéale pour la poussette ou le berceau.",
        price: 55000, originalPrice: 68000, stock: REALISTIC_STOCK(),
        tags: ["couverture", "bébé", "coton"],
        colors: [{ label: "Écru", hex: "#F5F5DC" }, { label: "Gris", hex: "#808080" }],
      },
      {
        sku: "ENF-005",
        title: "Gigoteuse en coton bio",
        description: "Gigoteuse confortable pour des nuits paisibles.",
        longDescription: "Coton bio, ouverture zip centrale. TOG 2.5, idéale pour 16-20°C.",
        price: 68000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["gigoteuse", "bébé", "nuit"],
        sizes: ["0-6 mois", "6-18 mois"],
      },
      {
        sku: "ENF-006",
        title: "Hochet en bois naturel",
        description: "Hochet artisanal en bois non traité.",
        longDescription: "Bois d'olivier naturel, non verni. Convient dès 3 mois.",
        price: 22000, stock: REALISTIC_STOCK(),
        tags: ["hochet", "bois", "éveil"],
      },
      {
        sku: "ENF-007",
        title: "Tablier enfant en coton",
        description: "Tablier coloré pour activités créatives.",
        longDescription: "Coton épais, cordons ajustables. Motif animalier brodé.",
        price: 25000, stock: REALISTIC_STOCK(),
        tags: ["tablier", "enfant", "activité"],
        colors: [{ label: "Jaune", hex: "#F4C430" }, { label: "Vert", hex: "#32CD32" }],
        sizes: ["2-4 ans", "4-6 ans", "6-8 ans"],
      },
      {
        sku: "ENF-008",
        title: "Chapeau de paille enfant",
        description: "Chapeau en paille tressée, protection UV.",
        longDescription: "Paille naturelle tressée, large bord. Protection UPF 50+.",
        price: 28000, stock: REALISTIC_STOCK(),
        tags: ["chapeau", "paille", "été", "enfant"],
        sizes: ["2-4 ans", "4-8 ans"],
      },
      {
        sku: "ENF-009",
        title: "Peluche artisanale en coton",
        description: "Peluche en coton doux, faite main.",
        longDescription: "Coton bio, rembourrage naturel. Motif lémurien ou caméléon.",
        price: 42000, originalPrice: 52000, stock: REALISTIC_STOCK(),
        tags: ["peluche", "artisanale", "coton"],
      },
      {
        sku: "ENF-010",
        title: "Ensemble naissance (3 pièces)",
        description: "Ensemble body + pyjama + bonnet en coton bio.",
        longDescription: "Trio en coton bio pour les premiers jours. Broderie prénom possible.",
        price: 85000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["ensemble", "naissance", "cadeau"],
        colors: [{ label: "Blanc", hex: "#FFFFFF" }, { label: "Bleu poudré", hex: "#B0C4DE" }, { label: "Rose poudré", hex: "#F4C2C2" }],
        sizes: ["Naissance", "1 mois", "3 mois"],
      },
    ],
  },

  // ══════════════ 9. PAPETERIE & ART ══════════════
  {
    slug: "papeterie-art",
    name: "Papeterie & Art",
    description: "Carnets, stylos et objets d'art en papier fait main.",
    iconName: "BookOpen",
    position: 9,
    products: [
      {
        sku: "PAP-001",
        title: "Carnet en papier fait main",
        description: "Carnet artisanal en papier naturel, relié cuir.",
        longDescription: "Papier fait main à partir de fibres de plantes. Couverture en cuir de zébu.",
        price: 48000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["carnet", "papier", "artisanal", "écriture"],
        colors: [{ label: "Cognac", hex: "#B87333" }, { label: "Noir", hex: "#000000" }],
      },
      {
        sku: "PAP-002",
        title: "Stylo artisanal en bois",
        description: "Stylo à bille sculpté main dans un bois précieux.",
        longDescription: "Bois de palissandre ou d'ébène, sculpté au tour. Rechargeable.",
        price: 35000, stock: REALISTIC_STOCK(),
        tags: ["stylo", "bois", "artisanal"],
        colors: [{ label: "Palissandre", hex: "#8B4513" }, { label: "Ébène", hex: "#1A1A1A" }],
      },
      {
        sku: "PAP-003",
        title: "Marque-page en cuir gravé",
        description: "Marque-page élégant en cuir véritable.",
        longDescription: "Cuir tanné végétal, gravure à chaud. Longueur 18 cm.",
        price: 15000, stock: REALISTIC_STOCK(),
        tags: ["marque-page", "cuir", "lecture"],
      },
      {
        sku: "PAP-004",
        title: "Aquarelle malgache encadrée",
        description: "Œuvre originale peinte à la main.",
        longDescription: "Aquarelle sur papier 300g. Cadre bois naturel, format 30 × 40 cm.",
        price: 165000, originalPrice: 200000, stock: REALISTIC_STOCK(),
        tags: ["aquarelle", "art", "peinture", "encadré"],
      },
      {
        sku: "PAP-005",
        title: "Cartes postales illustrées (×10)",
        description: "Lot de 10 cartes postales aux illustrations locales.",
        longDescription: "Papier épais 300g, illustrations originales. Idéal à envoyer ou encadrer.",
        price: 18000, stock: REALISTIC_STOCK(),
        tags: ["cartes", "postales", "illustration", "cadeau"],
      },
      {
        sku: "PAP-006",
        title: "Sous-main en cuir personnalisé",
        description: "Sous-main élégant en cuir naturel.",
        longDescription: "Cuir tanné main, format A3 (45 × 35 cm). Personnalisation possible.",
        price: 85000, stock: REALISTIC_STOCK(),
        tags: ["sous-main", "cuir", "bureau"],
      },
      {
        sku: "PAP-007",
        title: "Journal intime relié",
        description: "Journal élégant avec fermeture aimantée.",
        longDescription: "180 pages papier ivoire. Reliure artisanale, fermeture aimant.",
        price: 55000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["journal", "relié", "écriture"],
      },
      {
        sku: "PAP-008",
        title: "Coffret de correspondance",
        description: "Coffret complet pour lettres manuscrites.",
        longDescription: "20 feuilles, 10 enveloppes, sceau de cire. Boîte bois gravée.",
        price: 95000, originalPrice: 115000, stock: REALISTIC_STOCK(),
        tags: ["coffret", "correspondance", "lettres"],
      },
      {
        sku: "PAP-009",
        title: "Album photo artisanal",
        description: "Album photo à pages vierges pour coller.",
        longDescription: "40 pages cartonnées, couverture en toile brodée. Format 30 × 30 cm.",
        price: 72000, stock: REALISTIC_STOCK(),
        tags: ["album", "photo", "souvenir"],
      },
      {
        sku: "PAP-010",
        title: "Bloc-notes en raphia",
        description: "Bloc-notes original à couverture raphia.",
        longDescription: "80 feuilles lignées. Couverture raphia tressé main.",
        price: 22000, stock: REALISTIC_STOCK(),
        tags: ["bloc-notes", "raphia", "papeterie"],
      },
    ],
  },

  // ══════════════ 10. BOISSONS & THÉ ══════════════
  {
    slug: "boissons-the",
    name: "Boissons & Thé",
    description: "Thés, cafés, infusions et boissons artisanales.",
    iconName: "CupSoda",
    position: 10,
    products: [
      {
        sku: "BOI-001",
        title: "Thé vert de Madagascar",
        description: "Thé vert de qualité supérieure, feuilles entières.",
        longDescription: "Cultivé dans les Hautes Terres. Séchage traditionnel, arôme délicat.",
        price: 24000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["thé", "vert", "naturel"],
        sizes: ["100 g", "250 g"],
      },
      {
        sku: "BOI-002",
        title: "Café arabica des Hauts Plateaux",
        description: "Café arabica torréfié artisanalement.",
        longDescription: "Grains d'arabica cultivés en altitude. Torréfaction moyenne, notes chocolatées.",
        price: 38000, originalPrice: 45000, stock: REALISTIC_STOCK(),
        tags: ["café", "arabica", "torréfié"],
        sizes: ["250 g", "500 g", "1 kg"],
      },
      {
        sku: "BOI-003",
        title: "Rhum arrangé artisanal",
        description: "Rhum arrangé maison aux fruits locaux.",
        longDescription: "Rhum blanc macéré avec vanille, cannelle et fruits de saison. 45% vol.",
        price: 85000, stock: REALISTIC_STOCK(),
        tags: ["rhum", "arrangé", "artisanal", "alcool"],
      },
      {
        sku: "BOI-004",
        title: "Jus de fruits naturels (lot de 3)",
        description: "Jus 100% pur jus, sans sucre ajouté.",
        longDescription: "3 bouteilles 50 cl : mangue, goyave, ananas. Pasteurisés.",
        price: 28000, stock: REALISTIC_STOCK(),
        tags: ["jus", "fruit", "naturel", "bio"],
      },
      {
        sku: "BOI-005",
        title: "Infusion verveine citronnelle",
        description: "Mélange d'herbes apaisantes à infuser.",
        longDescription: "Verveine + citronnelle + menthe. Favorise la détente et la digestion.",
        price: 18000, stock: REALISTIC_STOCK(),
        tags: ["infusion", "verveine", "relaxant"],
      },
      {
        sku: "BOI-006",
        title: "Sirop de canne artisanal",
        description: "Sirop pur de canne, sucré naturellement.",
        longDescription: "Réduit de jus de canne. Idéal pour cocktails et desserts.",
        price: 22000, stock: REALISTIC_STOCK(),
        tags: ["sirop", "canne", "sucré"],
      },
      {
        sku: "BOI-007",
        title: "Liqueur de vanille",
        description: "Liqueur douce parfumée à la vanille Bourbon.",
        longDescription: "Base rhum + vanille Bourbon. Idéale en digestif ou cuisine. 30% vol.",
        price: 78000, originalPrice: 95000, stock: REALISTIC_STOCK(), isNew: true,
        tags: ["liqueur", "vanille", "alcool", "premium"],
      },
      {
        sku: "BOI-008",
        title: "Thé noir aux épices",
        description: "Thé noir parfumé aux épices malgaches.",
        longDescription: "Mélange thé noir + girofle, cannelle, gingembre. Réconfortant.",
        price: 26000, stock: REALISTIC_STOCK(),
        tags: ["thé", "épices", "noir"],
      },
      {
        sku: "BOI-009",
        title: "Café Robusta corsé",
        description: "Café Robusta intense, torréfaction foncée.",
        longDescription: "Robusta 100%, goût puissant et corsé. Idéal pour expresso.",
        price: 32000, stock: REALISTIC_STOCK(),
        tags: ["café", "robusta", "corsé"],
        sizes: ["250 g", "500 g"],
      },
      {
        sku: "BOI-010",
        title: "Eau-de-vie de canne",
        description: "Eau-de-vie artisanale distillée localement.",
        longDescription: "Distillation traditionnelle en alambic cuivre. 50% vol.",
        price: 65000, stock: REALISTIC_STOCK(),
        tags: ["eau-de-vie", "canne", "artisanal"],
      },
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN (upsert — ne casse rien si déjà présent)
// ═════════════════════════════════════════════════════════════════════════════

async function seedAdmin() {
  const required = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} est requis pour initialiser l'administrateur.`);
    return value;
  };

  const isProduction = process.env.NODE_ENV === "production";
  const adminEmail = isProduction
    ? required("INITIAL_ADMIN_EMAIL").toLowerCase()
    : process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase() || "admin@lurevia.mg";
  const adminPhone = isProduction
    ? required("INITIAL_ADMIN_PHONE")
    : process.env.INITIAL_ADMIN_PHONE?.trim() || "+261340000000";
  const adminPasswordRaw = isProduction
    ? required("INITIAL_ADMIN_PASSWORD")
    : process.env.INITIAL_ADMIN_PASSWORD || "ChangeMe12345!";

  if (isProduction && adminPasswordRaw.length < 12) {
    throw new Error("INITIAL_ADMIN_PASSWORD doit contenir au moins 12 caractères.");
  }

  const passwordHash = await hashPassword(adminPasswordRaw);
  const resetPassword = process.env.INITIAL_ADMIN_RESET_PASSWORD === "true";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      ...(resetPassword ? { passwordHash } : {}),
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

  console.log(`✅ Administrateur : ${adminEmail}`);
}

// ═════════════════════════════════════════════════════════════════════════════
// CATÉGORIES + PRODUITS
// ═════════════════════════════════════════════════════════════════════════════

async function seedCategoriesAndProducts() {
  console.log("\n📁 Import des catégories et produits…\n");

  let totalProducts = 0;
  let totalSkipped = 0;

  for (const category of CATEGORIES) {
    // Upsert catégorie
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        iconName: category.iconName,
        position: category.position,
        imageUrl: categoryImage(category.slug, "card"),
        bannerUrl: categoryImage(category.slug, "banner"),
      },
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

    console.log(`📂 ${category.name}`);

    for (const p of category.products) {
      // Skip si le produit existe déjà (par SKU)
      const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
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

  console.log(`\n📊 Bilan : ${totalProducts} produits créés, ${totalSkipped} déjà présents.`);
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("🚀 Démarrage du seed Lurevia…\n");

  await seedAdmin();
  await seedCategoriesAndProducts();

  console.log("\n🌱 Seed terminé avec succès.");
}

main()
  .catch((err) => {
    console.error("❌ Erreur durant le seed :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });