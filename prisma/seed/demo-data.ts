import {
  AuthIdentifier,
  AuthProvider,
  PrismaClient,
  ProvinceMadagascar,
  RegionMadagascar,
  Role,
} from "@prisma/client";
import { hashPassword } from "../../src/utils/password";

const CUSTOMER_COUNT = 10_000;
const ORDER_COUNT = 1_200;
const EMAIL_PREFIX = "demo.client.";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const CUSTOMER_NAMES = [
  "Miora Rakoto", "Fanja Andrianina", "Hanta Rasoanaivo", "Lova Randria",
  "Tiana Razafindrakoto", "Soa Rakotomalala", "Noro Raveloson", "Toky Andry",
];

const emailForCustomer = (number: number) =>
  `${EMAIL_PREFIX}${String(number).padStart(5, "0")}@lurevia.test`;

export const seedDemoData = async (prisma: PrismaClient) => {
  await seedVerifiedCustomers(prisma);
  await seedTransactions(prisma);
};

const seedVerifiedCustomers = async (prisma: PrismaClient) => {
  const password = process.env.DEMO_CUSTOMER_PASSWORD || "Client1234!";
  const passwordHash = await hashPassword(password);
  const now = Date.now();

  for (let start = 1; start <= CUSTOMER_COUNT; start += 1_000) {
    const end = Math.min(start + 1_000, CUSTOMER_COUNT + 1);
    const customers = Array.from({ length: end - start }, (_, offset) => {
      const number = start + offset;
      const createdAt = new Date(now - ((number * 37) % 365) * DAY_IN_MS);
      return {
        fullName: `${CUSTOMER_NAMES[number % CUSTOMER_NAMES.length]} ${number}`,
        email: emailForCustomer(number),
        phone: `+26133${String(number).padStart(7, "0")}`,
        passwordHash,
        primaryIdentifier: AuthIdentifier.EMAIL,
        primaryProvider: AuthProvider.LOCAL,
        role: Role.CUSTOMER,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt,
        updatedAt: createdAt,
      };
    });

    await prisma.user.createMany({ data: customers, skipDuplicates: true });
  }

  console.log(`   ✅ ${CUSTOMER_COUNT} clients de démonstration vérifiés`);
  console.log(`   🔐 Mot de passe client : ${password}`);
};

const seedTransactions = async (prisma: PrismaClient) => {
  const customers = await prisma.user.findMany({
    where: { email: { startsWith: EMAIL_PREFIX } },
    orderBy: { email: "asc" },
    take: ORDER_COUNT,
    select: { id: true, fullName: true, email: true, phone: true },
  });
  const products = await prisma.product.findMany({
    where: { owner: { role: Role.SELLER }, isActive: true },
    orderBy: { sku: "asc" },
    select: {
      id: true,
      title: true,
      sku: true,
      price: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });

  if (customers.length < ORDER_COUNT || products.length === 0) {
    throw new Error("Seed des clients et produits requis avant les transactions de démonstration.");
  }

  const now = Date.now();
  const ordersToSeed = Array.from({ length: ORDER_COUNT }, (_, index) => {
    const customer = customers[index];
    const product = products[(index * 37) % products.length];
    const quantity = (index % 3) + 1;
    const subtotal = (product.price ?? 25_000) * quantity;
    const shippingCost = 8_000;
    const orderNumber = `DEMO-${String(index + 1).padStart(6, "0")}`;
    const createdAt = new Date(now - ((index * 17) % 90) * DAY_IN_MS);
    return {
      orderNumber,
      customer,
      product,
      quantity,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      createdAt,
    };
  });

  for (let start = 0; start < ordersToSeed.length; start += 250) {
    const batch = ordersToSeed.slice(start, start + 250);
    await prisma.order.createMany({
      skipDuplicates: true,
      data: batch.map((item) => ({
        orderNumber: item.orderNumber,
        userId: item.customer.id,
        status: "DELIVERED",
        paymentMethod: "MOBILE_MONEY",
        currency: "MGA",
        deliveryMode: "HOME_DELIVERY",
        shippingFullName: item.customer.fullName,
        shippingPhone: item.customer.phone ?? "+261330000000",
        shippingEmail: item.customer.email,
        shippingProvince: ProvinceMadagascar.ANTANANARIVO,
        shippingRegion: RegionMadagascar.ANALAMANGA,
        shippingCity: "Antananarivo",
        shippingAddress: "Adresse de démonstration, Analamanga",
        subtotal: item.subtotal,
        shippingCost: item.shippingCost,
        total: item.total,
        paidAt: item.createdAt,
        shippedAt: item.createdAt,
        deliveredAt: item.createdAt,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      })),
    });
  }

  const orders = await prisma.order.findMany({
    where: { orderNumber: { in: ordersToSeed.map((item) => item.orderNumber) } },
    select: { id: true, orderNumber: true },
  });
  const orderIds = orders.map((order) => order.id);
  const [existingItems, existingTransactions] = await Promise.all([
    prisma.orderItem.findMany({ where: { orderId: { in: orderIds } }, select: { orderId: true } }),
    prisma.transaction.findMany({ where: { orderId: { in: orderIds } }, select: { orderId: true } }),
  ]);
  const itemOrderIds = new Set(existingItems.map((item) => item.orderId));
  const transactionOrderIds = new Set(existingTransactions.map((item) => item.orderId));
  const orderByNumber = new Map(orders.map((order) => [order.orderNumber, order.id]));

  await prisma.orderItem.createMany({
    data: ordersToSeed.flatMap((item) => {
      const orderId = orderByNumber.get(item.orderNumber);
      if (!orderId || itemOrderIds.has(orderId)) return [];
      return [{
        orderId,
        productId: item.product.id,
        titleSnapshot: item.product.title,
        imageSnapshot: item.product.images[0]?.url,
        skuSnapshot: item.product.sku,
        priceSnapshot: item.product.price ?? 25_000,
        quantity: item.quantity,
      }];
    }),
  });

  await prisma.transaction.createMany({
    data: ordersToSeed.flatMap((item) => {
      const orderId = orderByNumber.get(item.orderNumber);
      if (!orderId || transactionOrderIds.has(orderId)) return [];
      return [{
        orderId,
        amount: item.total,
        currency: "MGA",
        method: "MOBILE_MONEY",
        provider: "MVOLA",
        status: "SUCCESS",
        externalId: `DEMO-PAY-${item.orderNumber}`,
        idempotencyKey: `demo-seed-${item.orderNumber}`,
        signatureVerified: true,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        completedAt: item.createdAt,
      }];
    }),
  });

  console.log(`   ✅ ${ORDER_COUNT} commandes livrées et paiements simulés`);
};