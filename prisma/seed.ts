// prisma/seed.ts
import { PrismaClient, AuthIdentifier, AuthProvider, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Initialisation de la base de données pour la production...");

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

  console.log(`Creating root administrator: ${adminEmail}...`);

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

  console.log("✅ Administrateur créé avec succès.");
  if (process.env.NODE_ENV !== "production") {
    console.log(`🔑 Identifiants : ${adminEmail} / ${adminPasswordRaw}`);
    console.log("⚠️  IMPORTANT : Changez ce mot de passe immédiatement après la première connexion !");
  }
}

main()
  .catch((err) => {
    console.error("❌ Erreur lors de l'initialisation :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
