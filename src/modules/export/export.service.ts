import { Workbook } from "exceljs";
import { prisma } from "../../lib/prisma";

export const exportService = {
  async exportUserData(userId: string) {
    const workbook = new Workbook();

    // 1. Fetch all user data in a comprehensive query
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: {
          include: { items: true },
        },
        reviews: true,
        serviceFeedbacks: true,
        bids: true,
        favorites: {
          include: { product: true },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // --- Sheet 1: Profile ---
    const profileSheet = workbook.addWorksheet("Profil");
    profileSheet.columns = [
      { header: "Nom Complet", key: "fullName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Téléphone", key: "phone", width: 20 },
      { header: "Rôle", key: "role", width: 15 },
    ];
    profileSheet.addRow({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    profileSheet.getRow(1).font = { bold: true };

    // --- Sheet 2: Addresses ---
    const addressSheet = workbook.addWorksheet("Adresses");
    addressSheet.columns = [
      { header: "Label", key: "label", width: 20 },
      { header: "Nom Complet", key: "fullName", width: 30 },
      { header: "Ville", key: "city", width: 20 },
      { header: "Région", key: "region", width: 20 },
      { header: "Latitude", key: "latitude", width: 15 },
      { header: "Longitude", key: "longitude", width: 15 },
      { header: "Adresse", key: "address", width: 40 },
    ];
    user.addresses.forEach((addr) => {
      addressSheet.addRow({
        label: addr.label,
        fullName: addr.fullName,
        city: addr.city,
        region: addr.region,
        latitude: addr.latitude,
        longitude: addr.longitude,
        address: addr.address,
      });
    });
    addressSheet.getRow(1).font = { bold: true };

    // --- Sheet 3: Orders ---
    const orderSheet = workbook.addWorksheet("Commandes");
    orderSheet.columns = [
      { header: "N° Commande", key: "orderNumber", width: 20 },
      { header: "Total", key: "total", width: 15 },
      { header: "Statut", key: "status", width: 15 },
      { header: "Date", key: "date", width: 20 },
      { header: "Produits", key: "products", width: 50 },
    ];
    user.orders.forEach((order) => {
      const productList = order.items
        .map((item) => `${item.titleSnapshot} (x${item.quantity})`)
        .join(", ");
      orderSheet.addRow({
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        date: order.createdAt.toISOString(),
        products: productList,
      });
    });
    orderSheet.getRow(1).font = { bold: true };

    // --- Sheet 4: Activity (Bids & Reviews) ---
    const activitySheet = workbook.addWorksheet("Activités");
    activitySheet.columns = [
      { header: "Type", key: "type", width: 15 },
      { header: "Détail", key: "detail", width: 50 },
      { header: "Valeur/Note", key: "value", width: 15 },
      { header: "Statut", key: "status", width: 15 },
      { header: "Date", key: "date", width: 20 },
    ];

    // Add Bids
    user.bids.forEach((bid) => {
      activitySheet.addRow({
        type: "OFFRE",
        detail: `Produit ID: ${bid.productId}`,
        value: bid.proposedPrice,
        status: bid.status,
        date: bid.createdAt.toISOString(),
      });
    });

    // Add Reviews
    user.reviews.forEach((review) => {
      activitySheet.addRow({
        type: "AVIS",
        detail: `Produit ID: ${review.productId}`,
        value: review.rating,
        status: review.isApproved ? "Approuvé" : "En attente",
        date: review.createdAt.toISOString(),
      });
    });
    activitySheet.getRow(1).font = { bold: true };

    return workbook;
  },
};
