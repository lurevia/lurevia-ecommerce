// prisma/seed.ts
import { PrismaClient, AuthIdentifier, AuthProvider, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Initialisation de la base de données pour la production...");

  // On définit les identifiants de l'administrateur principal
  // En production, il est recommandé d'utiliser des variables d'environnement pour ces valeurs
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@lurevia.mg";
  const adminPhone = process.env.INITIAL_ADMIN_PHONE || "+261340000000";
  const adminPasswordRaw = process.env.INITIAL_ADMIN_PASSWORD || "ChangeMe12345!";

  console.log(`Creating root administrator: ${adminEmail}...`);

  const passwordHash = await hashPassword(adminPasswordRaw);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // On ne modifie pas l'admin s'il existe déjà
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
