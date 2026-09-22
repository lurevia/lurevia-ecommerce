-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'USED', 'EXPIRED');

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "code" TEXT,
    "expiresAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_requests_userId_idx" ON "verification_requests"("userId");

-- CreateIndex
CREATE INDEX "verification_requests_status_idx" ON "verification_requests"("status");

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
