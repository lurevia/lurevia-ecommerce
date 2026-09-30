import { Router } from "express";

import { attachUserIfPresent } from "../middlewares/auth.middleware";

import authRoutes from "../modules/auth/auth.routes";
import usersRoutes from "../modules/users/users.routes";
import identityVerificationsRoutes from "../modules/identity-verifications/identity-verifications.routes";
import addressesRoutes from "../modules/addresses/addresses.routes";
import categoriesRoutes from "../modules/categories/categories.routes";
import productsRoutes from "../modules/products/products.routes";
import { productReviewsRouter, reviewsRouter } from "../modules/reviews/reviews.routes";
import bidsRoutes from "../modules/bids/bids.routes";
import auctionsRoutes from "../modules/auctions/auctions.routes";

import cartRoutes from "../modules/cart/cart.routes";
import favoritesRoutes from "../modules/favorites/favorites.routes";

import ordersRoutes from "../modules/orders/orders.routes";
import paymentsRoutes from "../modules/payments/payments.routes";
import deliveryTrackingRoutes from "../modules/delivery-tracking/delivery-tracking.routes";

import pickupPointsRoutes from "../modules/pickup-points/pickup-points.routes";
import shippingZonesRoutes from "../modules/shipping-zones/shipping-zones.routes";
import placesRoutes from "../modules/places/places.routes";
import feedbackRoutes from "../modules/feedback/feedback.routes";

import notificationsRoutes from "../modules/notifications/notifications.routes";
import messagesRoutes from "../modules/messages/messages.routes";
import newsletterRoutes from "../modules/newsletter/newsletter.routes";

import sellerRoutes from "../modules/seller/seller.routes";
import sellerContractsRoutes from "../modules/seller-contracts/seller-contracts.routes";
import settlementsRoutes from "../modules/settlements/settlements.routes";
import transfersRoutes from "../modules/transfers/transfers.routes";

import mediaRoutes from "../modules/media/media.routes";

import adminRoutes from "../modules/admin/admin.routes";
import settingsRoutes from "../modules/settings/settings.routes";
import exportRoutes from "../modules/export/export.routes";

const router = Router();

router.use(attachUserIfPresent);

router.get("/health", (_req, res) => {
  res.status(200).json({
    data: {
      status: "ok",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  });
});

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/identity-verifications", identityVerificationsRoutes);
router.use("/addresses", addressesRoutes);

router.use("/products/:productId/reviews", productReviewsRouter);

router.use("/auctions", auctionsRoutes);

router.use("/products", productsRoutes);

router.use("/bids", bidsRoutes);

router.use("/reviews", reviewsRouter);

router.use("/categories", categoriesRoutes);

router.use("/cart", cartRoutes);
router.use("/favorites", favoritesRoutes);

router.use("/orders", ordersRoutes);
router.use("/payments", paymentsRoutes);
router.use("/delivery-tracking", deliveryTrackingRoutes);

router.use("/pickup-points", pickupPointsRoutes);
router.use("/shipping-zones", shippingZonesRoutes);
router.use("/places", placesRoutes);

router.use("/feedback", feedbackRoutes);

router.use("/notifications", notificationsRoutes);
router.use("/messages", messagesRoutes);
router.use("/newsletter", newsletterRoutes);


router.use("/seller", sellerRoutes);
router.use("/seller-contracts", sellerContractsRoutes);
router.use("/settlements", settlementsRoutes);
router.use("/transfers", transfersRoutes);

router.use("/media", mediaRoutes);

router.use("/admin", adminRoutes);
router.use("/settings", settingsRoutes);
router.use("/export", exportRoutes);

export default router;