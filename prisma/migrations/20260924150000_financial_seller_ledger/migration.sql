CREATE TYPE "SellerContractType" AS ENUM ('PERCENTAGE', 'MONTHLY_FIXED');
CREATE TYPE "SellerContractStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING_REVIEW', 'READY', 'TRANSFER_PENDING', 'PAID', 'FAILED', 'CANCELLED');
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

CREATE TABLE "seller_contracts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sellerId" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "type" "SellerContractType" NOT NULL,
  "value" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MGA',
  "status" "SellerContractStatus" NOT NULL DEFAULT 'PENDING',
  "effectiveFrom" TIMESTAMP(3),
  "effectiveTo" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "reviewedBy" UUID,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seller_contracts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "seller_contracts_sellerId_version_key" ON "seller_contracts"("sellerId", "version");
CREATE INDEX "seller_contracts_sellerId_status_effectiveFrom_idx" ON "seller_contracts"("sellerId", "status", "effectiveFrom");
ALTER TABLE "seller_contracts" ADD CONSTRAINT "seller_contracts_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "seller_settlements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL,
  "sellerId" UUID NOT NULL,
  "contractId" UUID,
  "contractVersion" INTEGER,
  "grossAmount" INTEGER NOT NULL,
  "commissionAmount" INTEGER NOT NULL,
  "netAmount" INTEGER NOT NULL,
  "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seller_settlements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "seller_settlements_orderId_sellerId_key" ON "seller_settlements"("orderId", "sellerId");
CREATE INDEX "seller_settlements_sellerId_status_createdAt_idx" ON "seller_settlements"("sellerId", "status", "createdAt");
CREATE INDEX "seller_settlements_orderId_idx" ON "seller_settlements"("orderId");
ALTER TABLE "seller_settlements" ADD CONSTRAINT "seller_settlements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_settlements" ADD CONSTRAINT "seller_settlements_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seller_settlements" ADD CONSTRAINT "seller_settlements_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "seller_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "transfer_ledger" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "settlementId" UUID NOT NULL,
  "sellerId" UUID NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MGA',
  "idempotencyKey" TEXT NOT NULL,
  "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
  "externalReference" TEXT,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "transfer_ledger_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "transfer_ledger_idempotencyKey_key" ON "transfer_ledger"("idempotencyKey");
CREATE INDEX "transfer_ledger_sellerId_status_createdAt_idx" ON "transfer_ledger"("sellerId", "status", "createdAt");
CREATE INDEX "transfer_ledger_settlementId_idx" ON "transfer_ledger"("settlementId");
ALTER TABLE "transfer_ledger" ADD CONSTRAINT "transfer_ledger_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "seller_settlements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transfer_ledger" ADD CONSTRAINT "transfer_ledger_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
