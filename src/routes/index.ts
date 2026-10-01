import { Router } from "express";
import { attachUserIfPresent } from "../middlewares/auth.middleware";

// ─── Identité & compte ───
import { authRouter } from "../modules/auth";
import { usersRouter } from "../modules/users";
import { identityVerificationsRouter } from "../modules/identity-verifications";
import { addressesRouter } from "../modules/addresses";

// ─── Catalogue ───
import { categoriesRouter } from "../modules/categories";
import { productsRouter } from "../modules/products";
import { productReviewsRouter, reviewsRouter } from "../modules/reviews";
import { bidsRouter } from "../modules/bids";
import { auctionsRouter } from "../modules/auctions";

// ─── Panier & favoris ───
import { cartRouter } from "../modules/cart";
import { favoritesRouter } from "../modules/favorites";

// ─── Commandes & paiements ───
import { ordersRouter } from "../modules/orders";
import { paymentsRouter } from "../modules/payments";
import { deliveryTrackingRouter } from "../modules/delivery-tracking";

// ─── Logistique ───
import { pickupPointsRouter } from "../modules/pickup-points";
import { shippingZonesRouter } from "../modules/shipping-zones";
import { placesRouter } from "../modules/places";

// ─── Avis & feedback ───
import { feedbackRouter } from "../modules/feedback";

// ─── Notifications & messages ───
import { notificationsRouter } from "../modules/notifications";
import { messagesRouter } from "../modules/messages";
import { newsletterRouter } from "../modules/newsletter";

// ─── Business vendeur ───
import { sellerRouter } from "../modules/seller";
import { sellerContractsRouter } from "../modules/seller-contracts";
import { settlementsRouter } from "../modules/settlements";
import { transfersRouter } from "../modules/transfers";

// ─── Média ───
import { mediaRouter } from "../modules/media";

// ─── Admin & config ───
import { adminRouter } from "../modules/admin";
import { settingsRouter } from "../modules/settings";
import { exportRouter } from "../modules/export";

// ─────────────────────────────────────────────────────────────────────────────
// Router principal
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// Attache l'utilisateur (si connecté) à toutes les requêtes
router.use(attachUserIfPresent);

// ─── Santé ───
router.get("/health", (_req, res) => {
  res.status(200).json({
    data: {
      status: "ok",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── Identité ───
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/identity-verifications", identityVerificationsRouter);
router.use("/addresses", addressesRouter);

// ─── Catalogue ───
router.use("/products/:productId/reviews", productReviewsRouter);
router.use("/auctions", auctionsRouter);
router.use("/products", productsRouter);
router.use("/bids", bidsRouter);
router.use("/reviews", reviewsRouter);
router.use("/categories", categoriesRouter);

// ─── Panier & favoris ───
router.use("/cart", cartRouter);
router.use("/favorites", favoritesRouter);

// ─── Commandes & paiements ───
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/delivery-tracking", deliveryTrackingRouter);

// ─── Logistique ───
router.use("/pickup-points", pickupPointsRouter);
router.use("/shipping-zones", shippingZonesRouter);
router.use("/places", placesRouter);

// ─── Feedback ───
router.use("/feedback", feedbackRouter);

// ─── Notifications ───
router.use("/notifications", notificationsRouter);
router.use("/messages", messagesRouter);
router.use("/newsletter", newsletterRouter);

// ─── Business vendeur ───
router.use("/seller", sellerRouter);
router.use("/seller-contracts", sellerContractsRouter);
router.use("/settlements", settlementsRouter);
router.use("/transfers", transfersRouter);

// ─── Média ───
router.use("/media", mediaRouter);

// ─── Admin & config ───
router.use("/admin", adminRouter);
router.use("/settings", settingsRouter);
router.use("/export", exportRouter);

export default router;