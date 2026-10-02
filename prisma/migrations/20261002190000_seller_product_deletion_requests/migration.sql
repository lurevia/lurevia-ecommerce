CREATE TYPE "ProductDeletionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "product_deletion_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL,
  "sellerId" UUID NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "ProductDeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
  "adminNote" TEXT,
  "reviewedBy" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "product_deletion_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "product_deletion_requests_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "product_deletion_requests_sellerId_fkey"
    FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "product_deletion_requests_status_createdAt_idx"
ON "product_deletion_requests"("status", "createdAt");
CREATE INDEX "product_deletion_requests_sellerId_status_idx"
ON "product_deletion_requests"("sellerId", "status");
CREATE INDEX "product_deletion_requests_productId_status_idx"
ON "product_deletion_requests"("productId", "status");