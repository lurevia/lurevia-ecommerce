/*
  Warnings:

  - The `regions` column on the `shipping_zones` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[cinNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identityDocumentNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `province` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `region` on the `addresses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `deliveryMode` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingProvince` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `shippingRegion` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IdentityDocumentType" AS ENUM ('CIN', 'PASSPORT', 'DRIVER_LICENSE', 'RESIDENCE_PERMIT');

-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('FATHER', 'MOTHER', 'TUTOR', 'LEGAL_GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED', 'SOLD', 'UNSOLD');

-- CreateEnum
CREATE TYPE "AuctionMessageType" AS ENUM ('CHAT', 'BID', 'SYSTEM', 'MODERATION');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('HOME_DELIVERY', 'PICKUP_POINT');

-- CreateEnum
CREATE TYPE "ProvinceMadagascar" AS ENUM ('ANTANANARIVO', 'ANTSIRANANA', 'MAHAJANGA', 'TOAMASINA', 'FIANARANTSOA', 'TOLIARA');

-- CreateEnum
CREATE TYPE "RegionMadagascar" AS ENUM ('DIANA', 'SAVA', 'ITASY', 'ANALAMANGA', 'VAKINANKARATRA', 'BONGOLAVA', 'SOFIA', 'BOENY', 'BETSIBOKA', 'MELAKY', 'ALAOTRA_MANGORO', 'ATSINANANA', 'ANALANJIROFO', 'AMBATOSOA', 'AMORON_I_MANIA', 'HAUTE_MATSIATRA', 'VATOVAVY', 'FITOVINANY', 'ATSIMO_ATSINANANA', 'IHOROMBE', 'MENABE', 'ATSIMO_ANDREFANA', 'ANDROY', 'ANOSY');

-- CreateEnum
CREATE TYPE "IdentityVerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminNotificationType" ADD VALUE 'NEW_SELLER_KYC';
ALTER TYPE "AdminNotificationType" ADD VALUE 'CIN_VERIFICATION_REQUEST';
ALTER TYPE "AdminNotificationType" ADD VALUE 'GUARDIAN_CIN_VERIFICATION_REQUEST';
ALTER TYPE "AdminNotificationType" ADD VALUE 'AUCTION_DISPUTE';
ALTER TYPE "AdminNotificationType" ADD VALUE 'AUCTION_REPORT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BidStatus" ADD VALUE 'OUTBID';
ALTER TYPE "BidStatus" ADD VALUE 'WINNING';
ALTER TYPE "BidStatus" ADD VALUE 'WON';
ALTER TYPE "BidStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'IDENTITY_VERIFIED';
ALTER TYPE "NotificationType" ADD VALUE 'GUARDIAN_CONSENT_NEEDED';
ALTER TYPE "NotificationType" ADD VALUE 'AUCTION_STARTED';
ALTER TYPE "NotificationType" ADD VALUE 'AUCTION_OUTBID';
ALTER TYPE "NotificationType" ADD VALUE 'AUCTION_WON';
ALTER TYPE "NotificationType" ADD VALUE 'AUCTION_LOST';
ALTER TYPE "NotificationType" ADD VALUE 'AUCTION_ENDING_SOON';

-- AlterEnum
ALTER TYPE "ProductPricingMode" ADD VALUE 'AUCTION';

-- DropIndex
DROP INDEX "product_bids_productId_idx";

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN     "allowMinorWithGuardian" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "auctionAutoExtendMinutes" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "auctionChatEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "auctionChatModeration" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "auctionDefaultDurationH" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "auctionMinIncrement" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "auctionsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cinVerificationEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "homeDeliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minorAgeThreshold" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN     "pickupPointEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requireCinForCOD" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireCinForSellers" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "pickupPointId" UUID,
ADD COLUMN     "province" "ProvinceMadagascar" NOT NULL,
DROP COLUMN "region",
ADD COLUMN     "region" "RegionMadagascar" NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryAccuracy" DOUBLE PRECISION,
ADD COLUMN     "deliveryGpsSharedAt" TIMESTAMP(3),
ADD COLUMN     "deliveryLatitude" DOUBLE PRECISION,
ADD COLUMN     "deliveryLongitude" DOUBLE PRECISION,
ADD COLUMN     "deliveryMode" "DeliveryMode" NOT NULL,
ADD COLUMN     "shippingNeighborhood" TEXT,
ADD COLUMN     "shippingPickupPointId" UUID,
ADD COLUMN     "shippingProvince" "ProvinceMadagascar" NOT NULL,
DROP COLUMN "shippingRegion",
ADD COLUMN     "shippingRegion" "RegionMadagascar" NOT NULL;

-- AlterTable
ALTER TABLE "product_bids" ADD COLUMN     "autoBidMax" INTEGER,
ADD COLUMN     "isAutoBid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWinningBid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "auctionBidCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "auctionCurrentPrice" INTEGER,
ADD COLUMN     "auctionEndAt" TIMESTAMP(3),
ADD COLUMN     "auctionFinalPrice" INTEGER,
ADD COLUMN     "auctionReservePrice" INTEGER,
ADD COLUMN     "auctionStartAt" TIMESTAMP(3),
ADD COLUMN     "auctionStartPrice" INTEGER,
ADD COLUMN     "auctionStatus" "AuctionStatus" DEFAULT 'ACTIVE',
ADD COLUMN     "auctionWatcherCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "auctionWinnerId" UUID;

-- AlterTable
ALTER TABLE "shipping_zones" ADD COLUMN     "province" "ProvinceMadagascar",
DROP COLUMN "regions",
ADD COLUMN     "regions" "RegionMadagascar"[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cinNumber" TEXT,
ADD COLUMN     "cinVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "guardianCinDocumentUrl" TEXT,
ADD COLUMN     "guardianCinNumber" TEXT,
ADD COLUMN     "guardianCinVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "guardianConsentGivenAt" TIMESTAMP(3),
ADD COLUMN     "guardianConsentIp" TEXT,
ADD COLUMN     "guardianEmail" TEXT,
ADD COLUMN     "guardianFullName" TEXT,
ADD COLUMN     "guardianPhone" TEXT,
ADD COLUMN     "guardianRelation" "GuardianRelation",
ADD COLUMN     "identityDocumentNumber" TEXT,
ADD COLUMN     "identityDocumentType" "IdentityDocumentType",
ADD COLUMN     "identityDocumentUrl" TEXT,
ADD COLUMN     "identityRejectionReason" TEXT,
ADD COLUMN     "identityVerificationStatus" "IdentityVerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
ADD COLUMN     "identityVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "isMinor" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "identity_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "status" "IdentityVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "documentType" "IdentityDocumentType",
    "documentNumber" TEXT,
    "documentUrl" TEXT,
    "documentUrlBack" TEXT,
    "selfieUrl" TEXT,
    "cinNumber" TEXT,
    "isGuardianVerification" BOOLEAN NOT NULL DEFAULT false,
    "guardianFullName" TEXT,
    "guardianCinNumber" TEXT,
    "guardianRelation" "GuardianRelation",
    "guardianCinDocumentUrl" TEXT,
    "guardianPhone" TEXT,
    "guardianConsentProofUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" UUID,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_points" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "province" "ProvinceMadagascar" NOT NULL,
    "region" "RegionMadagascar" NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "shippingZoneId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_tracking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "courierId" UUID,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "userId" UUID,
    "type" "AuctionMessageType" NOT NULL DEFAULT 'CHAT',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_watchers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "auction_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "identity_verifications_userId_status_idx" ON "identity_verifications"("userId", "status");

-- CreateIndex
CREATE INDEX "identity_verifications_status_createdAt_idx" ON "identity_verifications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "identity_verifications_guardianCinNumber_idx" ON "identity_verifications"("guardianCinNumber");

-- CreateIndex
CREATE INDEX "pickup_points_province_region_idx" ON "pickup_points"("province", "region");

-- CreateIndex
CREATE INDEX "pickup_points_provider_idx" ON "pickup_points"("provider");

-- CreateIndex
CREATE INDEX "pickup_points_isActive_idx" ON "pickup_points"("isActive");

-- CreateIndex
CREATE INDEX "delivery_tracking_orderId_recordedAt_idx" ON "delivery_tracking"("orderId", "recordedAt");

-- CreateIndex
CREATE INDEX "delivery_tracking_courierId_recordedAt_idx" ON "delivery_tracking"("courierId", "recordedAt");

-- CreateIndex
CREATE INDEX "auction_messages_productId_createdAt_idx" ON "auction_messages"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "auction_messages_productId_type_idx" ON "auction_messages"("productId", "type");

-- CreateIndex
CREATE INDEX "auction_messages_userId_idx" ON "auction_messages"("userId");

-- CreateIndex
CREATE INDEX "auction_watchers_productId_isActive_idx" ON "auction_watchers"("productId", "isActive");

-- CreateIndex
CREATE INDEX "auction_watchers_lastSeenAt_idx" ON "auction_watchers"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "auction_watchers_productId_userId_key" ON "auction_watchers"("productId", "userId");

-- CreateIndex
CREATE INDEX "addresses_province_region_idx" ON "addresses"("province", "region");

-- CreateIndex
CREATE INDEX "orders_deliveryMode_status_idx" ON "orders"("deliveryMode", "status");

-- CreateIndex
CREATE INDEX "product_bids_productId_proposedPrice_idx" ON "product_bids"("productId", "proposedPrice" DESC);

-- CreateIndex
CREATE INDEX "product_bids_productId_status_idx" ON "product_bids"("productId", "status");

-- CreateIndex
CREATE INDEX "product_bids_productId_isWinningBid_idx" ON "product_bids"("productId", "isWinningBid");

-- CreateIndex
CREATE INDEX "products_pricingMode_auctionStatus_idx" ON "products"("pricingMode", "auctionStatus");

-- CreateIndex
CREATE INDEX "products_auctionEndAt_idx" ON "products"("auctionEndAt");

-- CreateIndex
CREATE INDEX "shipping_zones_province_idx" ON "shipping_zones"("province");

-- CreateIndex
CREATE UNIQUE INDEX "users_cinNumber_key" ON "users"("cinNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_identityDocumentNumber_key" ON "users"("identityDocumentNumber");

-- CreateIndex
CREATE INDEX "users_cinNumber_idx" ON "users"("cinNumber");

-- CreateIndex
CREATE INDEX "users_guardianCinNumber_idx" ON "users"("guardianCinNumber");

-- CreateIndex
CREATE INDEX "users_identityVerificationStatus_idx" ON "users"("identityVerificationStatus");

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_pickupPointId_fkey" FOREIGN KEY ("pickupPointId") REFERENCES "pickup_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_points" ADD CONSTRAINT "pickup_points_shippingZoneId_fkey" FOREIGN KEY ("shippingZoneId") REFERENCES "shipping_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_auctionWinnerId_fkey" FOREIGN KEY ("auctionWinnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_messages" ADD CONSTRAINT "auction_messages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_messages" ADD CONSTRAINT "auction_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_watchers" ADD CONSTRAINT "auction_watchers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_watchers" ADD CONSTRAINT "auction_watchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingPickupPointId_fkey" FOREIGN KEY ("shippingPickupPointId") REFERENCES "pickup_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;
