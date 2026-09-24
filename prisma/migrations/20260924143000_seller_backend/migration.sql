ALTER TABLE "products" ADD COLUMN "ownerId" UUID;
ALTER TABLE "service_feedbacks" ADD COLUMN "orderId" UUID;
ALTER TABLE "service_feedbacks" ADD COLUMN "productId" UUID;
CREATE INDEX "products_ownerId_idx" ON "products"("ownerId");
CREATE INDEX "service_feedbacks_orderId_idx" ON "service_feedbacks"("orderId");
CREATE INDEX "service_feedbacks_productId_idx" ON "service_feedbacks"("productId");
ALTER TABLE "products" ADD CONSTRAINT "products_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "service_feedbacks" ADD CONSTRAINT "service_feedbacks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "service_feedbacks" ADD CONSTRAINT "service_feedbacks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
