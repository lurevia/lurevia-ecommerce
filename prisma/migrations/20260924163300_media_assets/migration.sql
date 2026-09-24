CREATE TYPE "MediaArchiveStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'NOT_CONFIGURED');

CREATE TABLE "media_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "githubPath" TEXT NOT NULL,
    "contentType" VARCHAR(100) NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "githubSha" VARCHAR(100),
    "googleArchiveStatus" "MediaArchiveStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "googleArchiveError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_assets_ownerId_createdAt_idx" ON "media_assets"("ownerId", "createdAt");
CREATE INDEX "media_assets_googleArchiveStatus_idx" ON "media_assets"("googleArchiveStatus");
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
