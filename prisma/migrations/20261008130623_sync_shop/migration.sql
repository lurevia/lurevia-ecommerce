-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: sync_shop (version corrigée manuellement)
-- Règle d'or : backfill AVANT suppression, nullable AVANT NOT NULL.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. ENUMS ───
CREATE TYPE "SellerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');
CREATE TYPE "LeaderboardPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE "LeaderboardScope" AS ENUM ('GLOBAL', 'BY_CATEGORY', 'BY_REGION');
CREATE TYPE "RewardType" AS ENUM ('COMMISSION_DISCOUNT', 'PREMIUM_FEATURE', 'CASH_BONUS', 'FREE_SHIPPING_CREDITS', 'PROMOTED_LISTING_CREDITS', 'PHYSICAL_GIFT', 'BADGE_UPGRADE');
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'GRANTED', 'USED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "PremiumFeatureCode" AS ENUM ('FEATURED_BOUTIQUE', 'HOME_BANNER', 'ADVANCED_ANALYTICS', 'CUSTOM_DOMAIN', 'BULK_UPLOAD', 'PRIORITY_SUPPORT', 'AUTOMATED_MARKETING', 'ZERO_COMMISSION_DAY', 'NEGOTIABLE_PRODUCTS', 'AUCTION_UNLIMITED');
CREATE TYPE "AchievementCode" AS ENUM ('FIRST_SALE', 'FIRST_REVIEW', 'HUNDRED_SALES', 'THOUSAND_SALES', 'PERFECT_MONTH', 'TOP_SELLER_MONTH', 'TOP_SELLER_YEAR', 'FAST_SHIPPER', 'HIGHLY_RATED', 'MILLION_REVENUE', 'TEN_THOUSAND_SUBSCRIBERS', 'FIVE_STAR_STREAK');
CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
CREATE TYPE "FeedbackType" AS ENUM ('PRODUCT', 'BOUTIQUE', 'SERVICE');
CREATE TYPE "ContentLocale" AS ENUM ('FR', 'MG', 'EN');
CREATE TYPE "ModerationStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "SeoEntityType" AS ENUM ('BOUTIQUE', 'PRODUCT', 'CATEGORY', 'POST');
CREATE TYPE "SeoIssueSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "SeoIssueCode" AS ENUM ('TITLE_MISSING', 'TITLE_TOO_SHORT', 'TITLE_TOO_LONG', 'META_DESCRIPTION_MISSING', 'META_DESCRIPTION_TOO_SHORT', 'META_DESCRIPTION_TOO_LONG', 'FOCUS_KEYWORD_MISSING', 'KEYWORD_NOT_IN_TITLE', 'DESCRIPTION_TOO_SHORT', 'NO_ALT_TEXT', 'NOT_ENOUGH_IMAGES', 'NO_ATTRIBUTES', 'NO_FAQ', 'NO_CATEGORY', 'MISSING_TRANSLATION', 'DUPLICATE_CONTENT');
CREATE TYPE "ScoreComponent" AS ENUM ('TOTAL', 'SEO', 'CONTENT', 'TRUST', 'ENGAGEMENT', 'QUALITY', 'RECENCY', 'SERVICE');
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "JobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- ─── 2. NOUVELLES TABLES (créées en premier, aucune dépendance de données) ───

CREATE TABLE "boutiques" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "tagline" VARCHAR(160),
    "description" TEXT,
    "longDescription" TEXT,
    "story" TEXT,
    "values" TEXT,
    "bio" TEXT,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "province" "ProvinceMadagascar",
    "region" "RegionMadagascar",
    "city" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "websiteUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "whatsappNumber" TEXT,
    "linkedinUrl" TEXT,
    "legalName" TEXT,
    "legalRegistrationNumber" TEXT,
    "taxId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" UUID,
    "trustLevel" INTEGER NOT NULL DEFAULT 0,
    "returnPolicy" TEXT,
    "shippingPolicy" TEXT,
    "warrantyPolicy" TEXT,
    "processingTimeDays" INTEGER,
    "storeCategoryId" UUID,
    "ratingCache" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCountCache" INTEGER NOT NULL DEFAULT 0,
    "subscriberCountCache" INTEGER NOT NULL DEFAULT 0,
    "productCountCache" INTEGER NOT NULL DEFAULT 0,
    "salesCountCache" INTEGER NOT NULL DEFAULT 0,
    "viewCountCache" INTEGER NOT NULL DEFAULT 0,
    "favoriteCountCache" INTEGER NOT NULL DEFAULT 0,
    "scoreTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seoScoreCache" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contentScoreCache" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastProductAt" TIMESTAMP(3),
    "lastOrderAt" TIMESTAMP(3),
    "lastReviewAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "responseTimeMinutes" INTEGER,
    "tier" "SellerTier" NOT NULL DEFAULT 'BRONZE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedReason" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "boutiques_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "managed_boutiques" (
    "userId" UUID NOT NULL,
    "boutiqueId" UUID NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "managed_boutiques_pkey" PRIMARY KEY ("userId","boutiqueId")
);

CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "boutiqueId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "key" VARCHAR(60) NOT NULL,
    "value" VARCHAR(200) NOT NULL,
    "unit" VARCHAR(20),
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "locale" "ContentLocale" NOT NULL DEFAULT 'FR',
    "question" VARCHAR(300) NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_faqs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_tags" (
    "productId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("productId","tagId")
);

CREATE TABLE "product_localizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "locale" "ContentLocale" NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" VARCHAR(300),
    "description" TEXT,
    "longDescription" TEXT,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "focusKeyword" VARCHAR(80),
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readabilityScore" DOUBLE PRECISION,
    "contentHash" VARCHAR(64),
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "moderatedBy" UUID,
    "moderatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_localizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "boutique_localizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "locale" "ContentLocale" NOT NULL,
    "tagline" VARCHAR(160),
    "description" TEXT,
    "longDescription" TEXT,
    "story" TEXT,
    "values" TEXT,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "focusKeyword" VARCHAR(80),
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "boutique_localizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "boutique_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "locale" "ContentLocale" NOT NULL DEFAULT 'FR',
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "excerpt" VARCHAR(300),
    "content" TEXT NOT NULL,
    "coverUrl" TEXT,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "focusKeyword" VARCHAR(80),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3),
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "viewCountCache" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "boutique_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "slug_redirects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entityType" "SeoEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "oldSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "slug_redirects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "entityType" "SeoEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "locale" "ContentLocale" NOT NULL DEFAULT 'FR',
    "seoScore" DOUBLE PRECISION NOT NULL,
    "contentScore" DOUBLE PRECISION NOT NULL,
    "issueCount" INTEGER NOT NULL DEFAULT 0,
    "ruleSetId" UUID,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seo_audits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seo_issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auditId" UUID NOT NULL,
    "code" "SeoIssueCode" NOT NULL,
    "severity" "SeoIssueSeverity" NOT NULL,
    "field" TEXT,
    "message" TEXT,
    CONSTRAINT "seo_issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "productId" UUID,
    "orderId" UUID,
    "orderItemId" UUID,
    "boutiqueId" UUID,
    "period" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "criteria" JSONB,
    "category" "FeedbackCategory",
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" UUID,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "teamResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "job_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "runKey" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "processed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "meta" JSONB,
    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

-- platform_settings : voir plus bas, on RENOMME la table existante.

CREATE TABLE "product_daily_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "boutiqueId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "organicViews" INTEGER NOT NULL DEFAULT 0,
    "addToCart" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "unitsSold" INTEGER NOT NULL DEFAULT 0,
    "revenue" BIGINT NOT NULL DEFAULT 0,
    "avgPosition" DOUBLE PRECISION,
    CONSTRAINT "product_daily_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "boutique_daily_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "organicViews" INTEGER NOT NULL DEFAULT 0,
    "newSubscribers" INTEGER NOT NULL DEFAULT 0,
    "lostSubscribers" INTEGER NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" BIGINT NOT NULL DEFAULT 0,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "messagesAnswered" INTEGER NOT NULL DEFAULT 0,
    "avgResponseMinutes" INTEGER,
    CONSTRAINT "boutique_daily_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "search_term_daily_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "term" VARCHAR(120) NOT NULL,
    "locale" "ContentLocale" NOT NULL DEFAULT 'FR',
    "date" DATE NOT NULL,
    "searches" INTEGER NOT NULL DEFAULT 0,
    "zeroResult" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "search_term_daily_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "totalRevenue" INTEGER NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelledOrders" INTEGER NOT NULL DEFAULT 0,
    "returnedOrders" INTEGER NOT NULL DEFAULT 0,
    "disputedOrders" INTEGER NOT NULL DEFAULT 0,
    "avgOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "fiveStarReviews" INTEGER NOT NULL DEFAULT 0,
    "avgResponseMinutes" INTEGER DEFAULT 0,
    "onTimeDeliveryRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancellationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returnRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "disputeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newSubscribers" INTEGER NOT NULL DEFAULT 0,
    "lostSubscribers" INTEGER NOT NULL DEFAULT 0,
    "newProducts" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "scoreTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "tier" "SellerTier" NOT NULL DEFAULT 'BRONZE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seller_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scoring_rule_sets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "weightSeo" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "weightContent" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "weightTrust" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "weightEngagement" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "weightQuality" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "weightRecency" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "params" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "activeFrom" TIMESTAMP(3),
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scoring_rule_sets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_score_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "ruleSetId" UUID NOT NULL,
    "scoreSeo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreContent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreTrust" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreEngagement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreQuality" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreRecency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "breakdown" JSONB,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seller_score_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_leaderboards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "period" "LeaderboardPeriod" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "scope" "LeaderboardScope" NOT NULL DEFAULT 'GLOBAL',
    "scopeKey" TEXT NOT NULL DEFAULT 'ALL',
    "metric" "ScoreComponent" NOT NULL DEFAULT 'TOTAL',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seller_leaderboards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_leaderboard_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leaderboardId" UUID NOT NULL,
    "boutiqueId" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "scoreTotal" DOUBLE PRECISION NOT NULL,
    "tier" "SellerTier" NOT NULL DEFAULT 'BRONZE',
    "totalRevenue" INTEGER NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seller_leaderboard_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "premium_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" "PremiumFeatureCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT,
    "durationDays" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "premium_features_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_premium_access" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "source" TEXT,
    "reason" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seller_premium_access_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_rewards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "type" "RewardType" NOT NULL,
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" INTEGER,
    "currency" TEXT DEFAULT 'MGA',
    "featureId" UUID,
    "leaderboardEntryId" UUID,
    "achievementAwardId" UUID,
    "grantedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seller_rewards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" "AchievementCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT,
    "rarity" "AchievementRarity" NOT NULL DEFAULT 'COMMON',
    "points" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_achievement_awards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "achievementId" UUID NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodKey" TEXT NOT NULL DEFAULT 'LIFETIME',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seller_achievement_awards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seller_promotions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" INTEGER,
    "discountAmount" INTEGER,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minOrderAmount" INTEGER,
    "source" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seller_promotions_pkey" PRIMARY KEY ("id")
);

-- ─── 3. ALTERATIONS NON DESTRUCTIVES ───

-- categories : ajout de la hiérarchie + SEO (aucune donnée à préserver)
ALTER TABLE "categories"
  ADD COLUMN "depth" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "metaDescription" VARCHAR(160),
  ADD COLUMN "metaTitle" VARCHAR(70),
  ADD COLUMN "parentId" UUID,
  ADD COLUMN "path" TEXT NOT NULL DEFAULT '';

-- order_items : ajout boutiqueId nullable (backfill ci-dessous)
ALTER TABLE "order_items" ADD COLUMN "boutiqueId" UUID;

-- product_images : métadonnées SEO/perf (aucune donnée à préserver)
ALTER TABLE "product_images"
  ADD COLUMN "altText" VARCHAR(200),
  ADD COLUMN "blurHash" TEXT,
  ADD COLUMN "height" INTEGER,
  ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "width" INTEGER;

-- products : ajout boutiqueId NULLABLE, caches, dates
ALTER TABLE "products"
  ADD COLUMN "boutiqueId" UUID,
  ADD COLUMN "contentScoreCache" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "seoScoreCache" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ALTER COLUMN "auctionStatus" DROP DEFAULT;

-- ─── 4. BACKFILL BOUTIQUES DEPUIS USERS ───
-- Crée une boutique pour chaque user qui a des produits OU un nom de boutique public.
-- Gère les collisions de noms en suffixant #2, #3...
WITH user_store AS (
  SELECT
    u."id" AS user_id,
    COALESCE(u."publicStoreName", u."fullName") AS raw_name,
    u."publicStoreDescription" AS desc_,
    u."publicStoreLogoUrl" AS logo_,
    u."publicStoreCoverUrl" AS cover_,
    u."storeCategoryId" AS cat_,
    u."createdAt" AS u_created,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(u."publicStoreName", u."fullName")
      ORDER BY u."createdAt"
    ) AS rn
  FROM "users" u
  WHERE u."publicStoreName" IS NOT NULL
     OR EXISTS (SELECT 1 FROM "products" p WHERE p."ownerId" = u."id")
)
INSERT INTO "boutiques" (
  "id", "ownerId", "name", "slug",
  "description", "logoUrl", "coverUrl", "storeCategoryId",
  "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  us.user_id,
  CASE WHEN us.rn = 1 THEN us.raw_name ELSE us.raw_name || ' #' || us.rn END,
  LOWER(REGEXP_REPLACE(us.raw_name, '[^a-zA-Z0-9]+', '-', 'g'))
    || '-' || SUBSTRING(gen_random_uuid()::text, 1, 6),
  us.desc_,
  us.logo_,
  us.cover_,
  us.cat_,
  NOW(),
  NOW()
FROM user_store us;

-- ─── 5. BACKFILL products.boutiqueId ───
UPDATE "products" p
SET "boutiqueId" = b."id"
FROM "boutiques" b
WHERE b."ownerId" = p."ownerId";

-- Produits orphelins (ownerId NULL) → boutique "legacy" rattachée à un admin.
DO $$
DECLARE
  v_owner UUID;
  v_boutique UUID;
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM "products" WHERE "boutiqueId" IS NULL;
  IF v_count > 0 THEN
    SELECT "id" INTO v_owner FROM "users" WHERE "isPrimaryAdmin" = true LIMIT 1;
    IF v_owner IS NULL THEN
      SELECT "id" INTO v_owner FROM "users" ORDER BY "createdAt" LIMIT 1;
    END IF;

    INSERT INTO "boutiques" ("id", "ownerId", "name", "slug", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      v_owner,
      'Boutique legacy',
      'boutique-legacy-' || SUBSTRING(gen_random_uuid()::text, 1, 8),
      NOW(), NOW()
    )
    RETURNING "id" INTO v_boutique;

    UPDATE "products" SET "boutiqueId" = v_boutique WHERE "boutiqueId" IS NULL;
  END IF;
END $$;

-- ─── 6. BACKFILL order_items.boutiqueId ───
UPDATE "order_items" oi
SET "boutiqueId" = p."boutiqueId"
FROM "products" p
WHERE p."id" = oi."productId";

-- ─── 7. RENDRE boutiqueId OBLIGATOIRE (maintenant que tout est rempli) ───
ALTER TABLE "products" ALTER COLUMN "boutiqueId" SET NOT NULL;

-- ─── 8. MIGRER products.tags → tags + product_tags ───
INSERT INTO "tags" ("id", "name", "slug", "createdAt")
SELECT DISTINCT
  gen_random_uuid(),
  t.tag,
  LOWER(REGEXP_REPLACE(t.tag, '[^a-zA-Z0-9]+', '-', 'g')),
  NOW()
FROM "products" p
CROSS JOIN LATERAL UNNEST(p."tags") AS t(tag)
WHERE t.tag IS NOT NULL AND t.tag <> ''
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "product_tags" ("productId", "tagId")
SELECT DISTINCT
  p."id",
  tg."id"
FROM "products" p
CROSS JOIN LATERAL UNNEST(p."tags") AS t(tag)
JOIN "tags" tg
  ON tg."slug" = LOWER(REGEXP_REPLACE(t.tag, '[^a-zA-Z0-9]+', '-', 'g'))
ON CONFLICT DO NOTHING;

-- ─── 9. MIGRER product_reviews → feedbacks (type = PRODUCT) ───
INSERT INTO "feedbacks" (
  "id", "userId", "type", "productId", "orderId",
  "rating", "title", "comment",
  "isApproved", "approvedBy", "approvedAt",
  "rejectedBy", "rejectedAt", "rejectionReason",
  "createdAt", "updatedAt"
)
SELECT
  pr."id",
  pr."userId",
  'PRODUCT'::"FeedbackType",
  pr."productId",
  pr."orderId",
  pr."rating",
  pr."title",
  pr."comment",
  pr."isApproved",
  pr."approvedBy",
  pr."approvedAt",
  pr."rejectedBy",
  pr."rejectedAt",
  pr."rejectionReason",
  pr."createdAt",
  pr."updatedAt"
FROM "product_reviews" pr;

-- ─── 10. MIGRER service_feedbacks → feedbacks (type = SERVICE) ───
INSERT INTO "feedbacks" (
  "id", "userId", "type", "orderId", "productId",
  "rating", "comment", "criteria", "category", "teamResponse",
  "isApproved", "approvedBy", "approvedAt",
  "createdAt", "updatedAt"
)
SELECT
  sf."id",
  sf."userId",
  'SERVICE'::"FeedbackType",
  sf."orderId",
  sf."productId",
  sf."overallRating",
  sf."comment",
  sf."criteria",
  sf."category",
  sf."teamResponse",
  sf."isApproved",
  sf."approvedBy",
  sf."approvedAt",
  sf."createdAt",
  sf."updatedAt"
FROM "service_feedbacks" sf;

-- ─── 11. PEUPLER LES LOCALISATIONS PAR DÉFAUT (FR) ───
INSERT INTO "product_localizations" (
  "id", "productId", "locale", "title", "shortDescription", "description", "longDescription",
  "moderationStatus", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  p."id",
  'FR'::"ContentLocale",
  p."title",
  NULL,
  p."description",
  p."longDescription",
  'APPROVED'::"ModerationStatus",
  p."createdAt",
  p."updatedAt"
FROM "products" p;

INSERT INTO "boutique_localizations" (
  "id", "boutiqueId", "locale", "tagline", "description", "longDescription", "story", "values",
  "metaTitle", "metaDescription",
  "moderationStatus", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  b."id",
  'FR'::"ContentLocale",
  b."tagline",
  b."description",
  b."longDescription",
  b."story",
  b."values",
  b."metaTitle",
  b."metaDescription",
  'APPROVED'::"ModerationStatus",
  b."createdAt",
  b."updatedAt"
FROM "boutiques" b;

-- ─── 12. RENOMMER PlatformSettings → platform_settings (préserve la config) ───
ALTER TABLE "PlatformSettings" RENAME TO "platform_settings";
ALTER TABLE "platform_settings" RENAME CONSTRAINT "PlatformSettings_pkey" TO "platform_settings_pkey";

-- ─── 13. SUPPRIMER LES ANCIENNES CLÉS ÉTRANGÈRES ───
ALTER TABLE "product_reviews" DROP CONSTRAINT "product_reviews_orderId_fkey";
ALTER TABLE "product_reviews" DROP CONSTRAINT "product_reviews_productId_fkey";
ALTER TABLE "product_reviews" DROP CONSTRAINT "product_reviews_userId_fkey";
ALTER TABLE "products" DROP CONSTRAINT "products_ownerId_fkey";
ALTER TABLE "service_feedbacks" DROP CONSTRAINT "service_feedbacks_orderId_fkey";
ALTER TABLE "service_feedbacks" DROP CONSTRAINT "service_feedbacks_productId_fkey";
ALTER TABLE "service_feedbacks" DROP CONSTRAINT "service_feedbacks_userId_fkey";
ALTER TABLE "users" DROP CONSTRAINT "users_storeCategoryId_fkey";

-- ─── 14. SUPPRIMER LES ANCIENS INDEX REDONDANTS ───
DROP INDEX IF EXISTS "orders_orderNumber_idx";
DROP INDEX IF EXISTS "products_isActive_idx";
DROP INDEX IF EXISTS "products_ownerId_idx";
DROP INDEX IF EXISTS "transactions_externalId_idx";
DROP INDEX IF EXISTS "users_cinNumber_idx";
DROP INDEX IF EXISTS "users_email_idx";
DROP INDEX IF EXISTS "users_phone_idx";

-- ─── 15. SUPPRIMER LES ANCIENNES COLONNES (données migrées) ───
ALTER TABLE "products" DROP COLUMN "ownerId";
ALTER TABLE "products" DROP COLUMN "tags";

ALTER TABLE "users"
  DROP COLUMN "publicStoreCoverUrl",
  DROP COLUMN "publicStoreDescription",
  DROP COLUMN "publicStoreLogoUrl",
  DROP COLUMN "publicStoreName",
  DROP COLUMN "storeCategoryId";

-- ─── 16. SUPPRIMER LES ANCIENNES TABLES (données migrées) ───
DROP TABLE "product_reviews";
DROP TABLE "service_feedbacks";

-- ─── 17. INDEX ───
CREATE UNIQUE INDEX "boutiques_ownerId_key" ON "boutiques"("ownerId");
CREATE UNIQUE INDEX "boutiques_name_key" ON "boutiques"("name");
CREATE UNIQUE INDEX "boutiques_slug_key" ON "boutiques"("slug");
CREATE INDEX "boutiques_storeCategoryId_idx" ON "boutiques"("storeCategoryId");
CREATE INDEX "boutiques_isActive_deletedAt_idx" ON "boutiques"("isActive", "deletedAt");
CREATE INDEX "boutiques_isFeatured_scoreTotal_idx" ON "boutiques"("isFeatured", "scoreTotal" DESC);
CREATE INDEX "boutiques_scoreTotal_idx" ON "boutiques"("scoreTotal" DESC);
CREATE INDEX "boutiques_seoScoreCache_idx" ON "boutiques"("seoScoreCache" DESC);
CREATE INDEX "boutiques_ratingCache_idx" ON "boutiques"("ratingCache" DESC);
CREATE INDEX "boutiques_subscriberCountCache_idx" ON "boutiques"("subscriberCountCache" DESC);
CREATE INDEX "boutiques_province_region_idx" ON "boutiques"("province", "region");
CREATE INDEX "boutiques_publishedAt_idx" ON "boutiques"("publishedAt");

CREATE INDEX "managed_boutiques_boutiqueId_idx" ON "managed_boutiques"("boutiqueId");

CREATE INDEX "subscriptions_boutiqueId_idx" ON "subscriptions"("boutiqueId");
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");
CREATE UNIQUE INDEX "subscriptions_userId_boutiqueId_key" ON "subscriptions"("userId", "boutiqueId");

CREATE INDEX "product_attributes_key_value_idx" ON "product_attributes"("key", "value");
CREATE UNIQUE INDEX "product_attributes_productId_key_key" ON "product_attributes"("productId", "key");

CREATE INDEX "product_faqs_productId_locale_idx" ON "product_faqs"("productId", "locale");

CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");
CREATE INDEX "product_tags_tagId_idx" ON "product_tags"("tagId");

CREATE INDEX "product_localizations_locale_moderationStatus_idx" ON "product_localizations"("locale", "moderationStatus");
CREATE INDEX "product_localizations_contentHash_idx" ON "product_localizations"("contentHash");
CREATE UNIQUE INDEX "product_localizations_productId_locale_key" ON "product_localizations"("productId", "locale");

CREATE UNIQUE INDEX "boutique_localizations_boutiqueId_locale_key" ON "boutique_localizations"("boutiqueId", "locale");

CREATE INDEX "boutique_posts_status_publishedAt_idx" ON "boutique_posts"("status", "publishedAt" DESC);
CREATE UNIQUE INDEX "boutique_posts_boutiqueId_slug_key" ON "boutique_posts"("boutiqueId", "slug");

CREATE INDEX "slug_redirects_entityType_entityId_idx" ON "slug_redirects"("entityType", "entityId");
CREATE UNIQUE INDEX "slug_redirects_entityType_oldSlug_key" ON "slug_redirects"("entityType", "oldSlug");

CREATE INDEX "seo_audits_entityType_entityId_isLatest_idx" ON "seo_audits"("entityType", "entityId", "isLatest");
CREATE INDEX "seo_audits_boutiqueId_entityType_isLatest_idx" ON "seo_audits"("boutiqueId", "entityType", "isLatest");
CREATE INDEX "seo_audits_computedAt_idx" ON "seo_audits"("computedAt");

CREATE INDEX "seo_issues_auditId_idx" ON "seo_issues"("auditId");
CREATE INDEX "seo_issues_code_severity_idx" ON "seo_issues"("code", "severity");

CREATE INDEX "feedbacks_productId_isApproved_idx" ON "feedbacks"("productId", "isApproved");
CREATE INDEX "feedbacks_boutiqueId_isApproved_idx" ON "feedbacks"("boutiqueId", "isApproved");
CREATE INDEX "feedbacks_userId_type_idx" ON "feedbacks"("userId", "type");
CREATE INDEX "feedbacks_type_isApproved_createdAt_idx" ON "feedbacks"("type", "isApproved", "createdAt");
CREATE INDEX "feedbacks_orderId_idx" ON "feedbacks"("orderId");
CREATE INDEX "feedbacks_deletedAt_idx" ON "feedbacks"("deletedAt");
CREATE UNIQUE INDEX "feedbacks_userId_productId_key" ON "feedbacks"("userId", "productId");
CREATE UNIQUE INDEX "feedbacks_userId_boutiqueId_key" ON "feedbacks"("userId", "boutiqueId");
CREATE UNIQUE INDEX "feedbacks_userId_period_key" ON "feedbacks"("userId", "period");

CREATE INDEX "job_runs_name_status_startedAt_idx" ON "job_runs"("name", "status", "startedAt" DESC);
CREATE UNIQUE INDEX "job_runs_name_runKey_key" ON "job_runs"("name", "runKey");

CREATE INDEX "product_daily_stats_boutiqueId_date_idx" ON "product_daily_stats"("boutiqueId", "date");
CREATE INDEX "product_daily_stats_date_idx" ON "product_daily_stats"("date");
CREATE UNIQUE INDEX "product_daily_stats_productId_date_key" ON "product_daily_stats"("productId", "date");

CREATE INDEX "boutique_daily_stats_date_idx" ON "boutique_daily_stats"("date");
CREATE UNIQUE INDEX "boutique_daily_stats_boutiqueId_date_key" ON "boutique_daily_stats"("boutiqueId", "date");

CREATE INDEX "search_term_daily_stats_date_searches_idx" ON "search_term_daily_stats"("date", "searches" DESC);
CREATE UNIQUE INDEX "search_term_daily_stats_term_locale_date_key" ON "search_term_daily_stats"("term", "locale", "date");

CREATE INDEX "seller_stats_period_periodKey_scoreTotal_idx" ON "seller_stats"("period", "periodKey", "scoreTotal" DESC);
CREATE INDEX "seller_stats_period_periodKey_rank_idx" ON "seller_stats"("period", "periodKey", "rank");
CREATE INDEX "seller_stats_boutiqueId_period_idx" ON "seller_stats"("boutiqueId", "period");
CREATE UNIQUE INDEX "seller_stats_boutiqueId_period_periodKey_key" ON "seller_stats"("boutiqueId", "period", "periodKey");

CREATE UNIQUE INDEX "scoring_rule_sets_version_key" ON "scoring_rule_sets"("version");
CREATE INDEX "scoring_rule_sets_isActive_idx" ON "scoring_rule_sets"("isActive");

CREATE INDEX "seller_score_snapshots_period_periodKey_scoreTotal_idx" ON "seller_score_snapshots"("period", "periodKey", "scoreTotal" DESC);
CREATE INDEX "seller_score_snapshots_boutiqueId_period_idx" ON "seller_score_snapshots"("boutiqueId", "period");
CREATE UNIQUE INDEX "seller_score_snapshots_boutiqueId_period_periodKey_ruleSetI_key" ON "seller_score_snapshots"("boutiqueId", "period", "periodKey", "ruleSetId");

CREATE INDEX "seller_leaderboards_period_periodKey_scope_idx" ON "seller_leaderboards"("period", "periodKey", "scope");
CREATE UNIQUE INDEX "seller_leaderboards_period_periodKey_scope_scopeKey_metric_key" ON "seller_leaderboards"("period", "periodKey", "scope", "scopeKey", "metric");

CREATE INDEX "seller_leaderboard_entries_leaderboardId_rank_idx" ON "seller_leaderboard_entries"("leaderboardId", "rank");
CREATE INDEX "seller_leaderboard_entries_boutiqueId_idx" ON "seller_leaderboard_entries"("boutiqueId");
CREATE UNIQUE INDEX "seller_leaderboard_entries_leaderboardId_boutiqueId_key" ON "seller_leaderboard_entries"("leaderboardId", "boutiqueId");

CREATE UNIQUE INDEX "premium_features_code_key" ON "premium_features"("code");

CREATE INDEX "seller_premium_access_boutiqueId_isActive_idx" ON "seller_premium_access"("boutiqueId", "isActive");
CREATE INDEX "seller_premium_access_featureId_isActive_idx" ON "seller_premium_access"("featureId", "isActive");
CREATE INDEX "seller_premium_access_expiresAt_idx" ON "seller_premium_access"("expiresAt");

CREATE UNIQUE INDEX "seller_rewards_leaderboardEntryId_key" ON "seller_rewards"("leaderboardEntryId");
CREATE UNIQUE INDEX "seller_rewards_achievementAwardId_key" ON "seller_rewards"("achievementAwardId");
CREATE INDEX "seller_rewards_boutiqueId_status_idx" ON "seller_rewards"("boutiqueId", "status");
CREATE INDEX "seller_rewards_type_status_idx" ON "seller_rewards"("type", "status");
CREATE INDEX "seller_rewards_expiresAt_idx" ON "seller_rewards"("expiresAt");

CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

CREATE INDEX "seller_achievement_awards_boutiqueId_idx" ON "seller_achievement_awards"("boutiqueId");
CREATE INDEX "seller_achievement_awards_achievementId_idx" ON "seller_achievement_awards"("achievementId");
CREATE UNIQUE INDEX "seller_achievement_awards_boutiqueId_achievementId_periodKe_key" ON "seller_achievement_awards"("boutiqueId", "achievementId", "periodKey");

CREATE UNIQUE INDEX "seller_promotions_code_key" ON "seller_promotions"("code");
CREATE INDEX "seller_promotions_boutiqueId_isActive_idx" ON "seller_promotions"("boutiqueId", "isActive");

CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");
CREATE INDEX "categories_isActive_position_idx" ON "categories"("isActive", "position");

CREATE INDEX "order_items_boutiqueId_idx" ON "order_items"("boutiqueId");
CREATE INDEX "products_boutiqueId_isActive_deletedAt_idx" ON "products"("boutiqueId", "isActive", "deletedAt");
CREATE INDEX "products_isActive_seoScoreCache_idx" ON "products"("isActive", "seoScoreCache" DESC);
CREATE INDEX "users_role_idx" ON "users"("role");

-- ─── 18. CLÉS ÉTRANGÈRES ───
ALTER TABLE "boutiques" ADD CONSTRAINT "boutiques_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "boutiques" ADD CONSTRAINT "boutiques_storeCategoryId_fkey" FOREIGN KEY ("storeCategoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "managed_boutiques" ADD CONSTRAINT "managed_boutiques_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "managed_boutiques" ADD CONSTRAINT "managed_boutiques_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_faqs" ADD CONSTRAINT "product_faqs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_localizations" ADD CONSTRAINT "product_localizations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "boutique_localizations" ADD CONSTRAINT "boutique_localizations_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "boutique_posts" ADD CONSTRAINT "boutique_posts_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "scoring_rule_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "seo_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_daily_stats" ADD CONSTRAINT "product_daily_stats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "boutique_daily_stats" ADD CONSTRAINT "boutique_daily_stats_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_stats" ADD CONSTRAINT "seller_stats_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_score_snapshots" ADD CONSTRAINT "seller_score_snapshots_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_score_snapshots" ADD CONSTRAINT "seller_score_snapshots_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "scoring_rule_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seller_leaderboard_entries" ADD CONSTRAINT "seller_leaderboard_entries_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "seller_leaderboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_leaderboard_entries" ADD CONSTRAINT "seller_leaderboard_entries_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_premium_access" ADD CONSTRAINT "seller_premium_access_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_premium_access" ADD CONSTRAINT "seller_premium_access_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "premium_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_rewards" ADD CONSTRAINT "seller_rewards_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_rewards" ADD CONSTRAINT "seller_rewards_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "premium_features"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "seller_rewards" ADD CONSTRAINT "seller_rewards_leaderboardEntryId_fkey" FOREIGN KEY ("leaderboardEntryId") REFERENCES "seller_leaderboard_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "seller_rewards" ADD CONSTRAINT "seller_rewards_achievementAwardId_fkey" FOREIGN KEY ("achievementAwardId") REFERENCES "seller_achievement_awards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "seller_achievement_awards" ADD CONSTRAINT "seller_achievement_awards_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_achievement_awards" ADD CONSTRAINT "seller_achievement_awards_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_promotions" ADD CONSTRAINT "seller_promotions_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 19. SQL SPÉCIFIQUE POSTGRES (recherche, unicité partielle, CHECK) ───

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "product_loc_title_trgm"
  ON "product_localizations" USING gin ("title" gin_trgm_ops);

CREATE INDEX "product_loc_fts"
  ON "product_localizations"
  USING gin (to_tsvector('french', coalesce("title",'') || ' ' || coalesce("description",'')));

CREATE UNIQUE INDEX "seo_audit_latest"
  ON "seo_audits" ("entityType", "entityId", "locale")
  WHERE "isLatest" = true;

ALTER TABLE "feedbacks" ADD CONSTRAINT "feedback_type_target" CHECK (
  ("type" = 'PRODUCT'  AND "productId"  IS NOT NULL) OR
  ("type" = 'BOUTIQUE' AND "boutiqueId" IS NOT NULL) OR
  ("type" = 'SERVICE'  AND "period"     IS NOT NULL)
);