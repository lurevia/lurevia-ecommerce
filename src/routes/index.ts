import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import usersRoutes from "../modules/users/users.routes";
import addressesRoutes from "../modules/addresses/addresses.routes";
import categoriesRoutes from "../modules/categories/categories.routes";
import productsRoutes from "../modules/products/products.routes";
import cartRoutes from "../modules/cart/cart.routes";
import favoritesRoutes from "../modules/favorites/favorites.routes";
import ordersRoutes from "../modules/orders/orders.routes";
import { productReviewsRouter, reviewsRouter } from "../modules/reviews/reviews.routes";
import feedbackRoutes from "../modules/feedback/feedback.routes";
import notificationsRoutes from "../modules/notifications/notifications.routes";
import bidsRoutes from "../modules/bids/bids.routes";
import exportRoutes from "../modules/export/export.routes";
import newsletterRoutes from "../modules/newsletter/newsletter.routes";
import adminRoutes from "../modules/admin/admin.routes";
import messagesRoutes from "../modules/messages/messages.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/addresses", addressesRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);
router.use("/products/:productId/reviews", productReviewsRouter);
router.use("/reviews", reviewsRouter);
router.use("/cart", cartRoutes);
router.use("/favorites", favoritesRoutes);
router.use("/orders", ordersRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/bids", bidsRoutes);
router.use("/export", exportRoutes);
router.use("/admin", adminRoutes);
router.use("/messages", messagesRoutes);
router.use("/newsletter", newsletterRoutes);

router.get("/health", (_req, res) => {
  res.status(200).json({ data: { status: "ok", timestamp: new Date().toISOString() } });
});

export default router;
