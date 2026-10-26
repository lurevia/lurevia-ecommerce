-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthIdentifier" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "IdentityDocumentType" AS ENUM ('CIN', 'PASSPORT', 'DRIVER_LICENSE', 'RESIDENCE_PERMIT');

-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('FATHER', 'MOTHER', 'TUTOR', 'LEGAL_GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'USED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "IdentityVerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeletionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProfileChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SellerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "SellerContractType" AS ENUM ('PERCENTAGE', 'MONTHLY_FIXED');

-- CreateEnum
CREATE TYPE "SellerContractStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING_REVIEW', 'READY', 'TRANSFER_PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductPricingMode" AS ENUM ('FIXED', 'NEGOTIABLE', 'AUCTION', 'ON_REQUEST');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductDeletionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED', 'SOLD', 'UNSOLD');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'OUTBID', 'WINNING', 'WON', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuctionMessageType" AS ENUM ('CHAT', 'BID', 'SYSTEM', 'MODERATION');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'COD_PENDING', 'COD_FAILED', 'REFUNDED', 'PAYMENT_FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MOBILE_MONEY', 'CARD', 'COD', 'BANK_TRANSFERT');

-- CreateEnum
CREATE TYPE "MobileMoneyProvider" AS ENUM ('MVOLA', 'ORANGE_MONEY', 'AIRTEL_MONEY');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('HOME_DELIVERY', 'PICKUP_POINT');

-- CreateEnum
CREATE TYPE "ProvinceMadagascar" AS ENUM ('ANTANANARIVO', 'ANTSIRANANA', 'MAHAJANGA', 'TOAMASINA', 'FIANARANTSOA', 'TOLIARA');

-- CreateEnum
CREATE TYPE "RegionMadagascar" AS ENUM ('DIANA', 'SAVA', 'ITASY', 'ANALAMANGA', 'VAKINANKARATRA', 'BONGOLAVA', 'SOFIA', 'BOENY', 'BETSIBOKA', 'MELAKY', 'ALAOTRA_MANGORO', 'ATSINANANA', 'ANALANJIROFO', 'AMBATOSOA', 'AMORON_I_MANIA', 'HAUTE_MATSIATRA', 'VATOVAVY', 'FITOVINANY', 'ATSIMO_ATSINANANA', 'IHOROMBE', 'MENABE', 'ATSIMO_ANDREFANA', 'ANDROY', 'ANOSY');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('PRODUCT', 'BOUTIQUE', 'SERVICE');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('DELIVERY', 'PAYMENT', 'SUPPORT', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REVIEW_PENDING', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'PROMO', 'ACCOUNT_VERIFICATION', 'IDENTITY_VERIFIED', 'GUARDIAN_CONSENT_NEEDED', 'AUCTION_STARTED', 'AUCTION_OUTBID', 'AUCTION_WON', 'AUCTION_LOST', 'AUCTION_ENDING_SOON');

-- CreateEnum
CREATE TYPE "AdminNotificationType" AS ENUM ('NEW_ORDER', 'NEW_REVIEW', 'NEW_FEEDBACK', 'DELETION_REQUEST', 'LOW_STOCK', 'PROFILE_CHANGE_REQUEST', 'NEW_SELLER_KYC', 'CIN_VERIFICATION_REQUEST', 'GUARDIAN_CIN_VERIFICATION_REQUEST', 'AUCTION_DISPUTE', 'AUCTION_REPORT');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('ADMIN_MESSAGE', 'ORDER_UPDATE', 'PROMO', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "LeaderboardScope" AS ENUM ('GLOBAL', 'BY_CATEGORY', 'BY_REGION');

-- CreateEnum
CREATE TYPE "ScoreComponent" AS ENUM ('TOTAL', 'SEO', 'CONTENT', 'TRUST', 'ENGAGEMENT', 'QUALITY', 'RECENCY', 'SERVICE');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('COMMISSION_DISCOUNT', 'PREMIUM_FEATURE', 'CASH_BONUS', 'FREE_SHIPPING_CREDITS', 'PROMOTED_LISTING_CREDITS', 'PHYSICAL_GIFT', 'BADGE_UPGRADE');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'GRANTED', 'USED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PremiumFeatureCode" AS ENUM ('FEATURED_BOUTIQUE', 'HOME_BANNER', 'ADVANCED_ANALYTICS', 'CUSTOM_DOMAIN', 'BULK_UPLOAD', 'PRIORITY_SUPPORT', 'AUTOMATED_MARKETING', 'ZERO_COMMISSION_DAY', 'NEGOTIABLE_PRODUCTS', 'AUCTION_UNLIMITED');

-- CreateEnum
CREATE TYPE "AchievementCode" AS ENUM ('FIRST_SALE', 'FIRST_REVIEW', 'HUNDRED_SALES', 'THOUSAND_SALES', 'PERFECT_MONTH', 'TOP_SELLER_MONTH', 'TOP_SELLER_YEAR', 'FAST_SHIPPER', 'HIGHLY_RATED', 'MILLION_REVENUE', 'TEN_THOUSAND_SUBSCRIBERS', 'FIVE_STAR_STREAK');

-- CreateEnum
CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "ContentLocale" AS ENUM ('FR', 'MG', 'EN');

-- CreateEnum
CREATE TYPE "SeoEntityType" AS ENUM ('BOUTIQUE', 'PRODUCT', 'CATEGORY', 'POST');

-- CreateEnum
CREATE TYPE "SeoIssueSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SeoIssueCode" AS ENUM ('TITLE_MISSING', 'TITLE_TOO_SHORT', 'TITLE_TOO_LONG', 'META_DESCRIPTION_MISSING', 'META_DESCRIPTION_TOO_SHORT', 'META_DESCRIPTION_TOO_LONG', 'FOCUS_KEYWORD_MISSING', 'KEYWORD_NOT_IN_TITLE', 'DESCRIPTION_TOO_SHORT', 'NO_ALT_TEXT', 'NOT_ENOUGH_IMAGES', 'NO_ATTRIBUTES', 'NO_FAQ', 'NO_CATEGORY', 'MISSING_TRANSLATION', 'DUPLICATE_CONTENT');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'WHATSAPP', 'LINKEDIN', 'PINTEREST', 'X', 'OTHER');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'COOKIE_POLICY', 'SELLER_TERMS', 'REFUND_POLICY', 'SHIPPING_POLICY', 'LEGAL_NOTICE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentProvider" AS ENUM ('GOOGLE_DOCS', 'GOOGLE_DRIVE', 'EXTERNAL_URL', 'CMS', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SettingsDomain" AS ENUM ('SITE_IDENTITY', 'THEME', 'SOCIAL_LINKS', 'SEO', 'MAINTENANCE', 'LEGAL_DOCUMENTS', 'SHIPPING', 'PAYMENT_METHODS', 'SELLER_VERIFICATION', 'AUCTIONS', 'NOTIFICATIONS');

-- CreateEnum
CREATE TYPE "SettingsAuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "MediaArchiveStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'NOT_CONFIGURED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "auctions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "startPrice" INTEGER NOT NULL,
    "reservePrice" INTEGER,
    "currentPrice" INTEGER NOT NULL,
    "finalPrice" INTEGER,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "watcherCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_bids" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "proposedPrice" INTEGER NOT NULL,
    "comment" VARCHAR(255),
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "isAutoBid" BOOLEAN NOT NULL DEFAULT false,
    "autoBidMax" INTEGER,
    "isWinningBid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_bids_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "boutiques" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "logoUrl" VARCHAR(500),
    "coverUrl" VARCHAR(500),
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
    "tier" "SellerTier" NOT NULL DEFAULT 'BRONZE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedReason" VARCHAR(255),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "boutiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boutique_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "tagline" VARCHAR(160),
    "longDescription" TEXT,
    "story" TEXT,
    "values" TEXT,
    "bio" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boutique_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boutique_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "contactEmail" VARCHAR(120),
    "contactPhone" VARCHAR(30),
    "websiteUrl" VARCHAR(255),
    "whatsappNumber" VARCHAR(30),
    "facebookUrl" VARCHAR(255),
    "instagramUrl" VARCHAR(255),
    "tiktokUrl" VARCHAR(255),
    "linkedinUrl" VARCHAR(255),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boutique_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boutique_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "province" "ProvinceMadagascar",
    "region" "RegionMadagascar",
    "city" VARCHAR(100),
    "address" VARCHAR(255),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boutique_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boutique_legals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "legalName" VARCHAR(160),
    "legalRegistrationNumber" VARCHAR(60),
    "taxId" VARCHAR(60),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" UUID,
    "trustLevel" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boutique_legals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boutique_policies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "returnPolicy" TEXT,
    "shippingPolicy" TEXT,
    "warrantyPolicy" TEXT,
    "processingTimeDays" INTEGER DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boutique_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managed_boutiques" (
    "userId" UUID NOT NULL,
    "boutiqueId" UUID NOT NULL,
    "role" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "managed_boutiques_pkey" PRIMARY KEY ("userId","boutiqueId")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "boutiqueId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "bannerUrl" VARCHAR(500) NOT NULL,
    "iconName" VARCHAR(50) NOT NULL DEFAULT 'ShoppingBag',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" UUID,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "path" VARCHAR(255) NOT NULL DEFAULT '',
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "longDescription" TEXT,
    "pricingMode" "ProductPricingMode" NOT NULL DEFAULT 'FIXED',
    "price" INTEGER,
    "originalPrice" INTEGER,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "auctionStartPrice" INTEGER,
    "auctionReservePrice" INTEGER,
    "auctionCurrentPrice" INTEGER,
    "auctionStartAt" TIMESTAMP(3),
    "auctionEndAt" TIMESTAMP(3),
    "auctionStatus" "AuctionStatus",
    "auctionWinnerId" UUID,
    "auctionFinalPrice" INTEGER,
    "auctionBidCount" INTEGER NOT NULL DEFAULT 0,
    "auctionWatcherCount" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "ratingCache" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCountCache" INTEGER NOT NULL DEFAULT 0,
    "seoScoreCache" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contentScoreCache" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "altText" VARCHAR(200),
    "width" INTEGER,
    "height" INTEGER,
    "blurHash" VARCHAR(64),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_colors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "hex" VARCHAR(10) NOT NULL,

    CONSTRAINT "product_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sizes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "value" VARCHAR(50) NOT NULL,

    CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "productId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "key" VARCHAR(60) NOT NULL,
    "value" VARCHAR(200) NOT NULL,
    "unit" VARCHAR(20),
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "locale" "ContentLocale" NOT NULL DEFAULT 'FR',
    "question" VARCHAR(255) NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(60) NOT NULL,
    "slug" VARCHAR(70) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "productId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("productId","tagId")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "colorId" UUID,
    "sizeId" UUID,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_deletion_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "status" "ProductDeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" VARCHAR(255),
    "reviewedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "product_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "productId" UUID,
    "orderId" UUID,
    "orderItemId" UUID,
    "boutiqueId" UUID,
    "period" VARCHAR(20),
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(120),
    "comment" TEXT NOT NULL,
    "criteria" JSONB,
    "category" "FeedbackCategory",
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" UUID,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" VARCHAR(255),
    "teamResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "seller_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "periodKey" VARCHAR(50) NOT NULL,
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

-- CreateTable
CREATE TABLE "scoring_rule_sets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "version" INTEGER NOT NULL,
    "name" VARCHAR(120) NOT NULL,
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

-- CreateTable
CREATE TABLE "seller_score_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "period" "LeaderboardPeriod" NOT NULL,
    "periodKey" VARCHAR(50) NOT NULL,
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

-- CreateTable
CREATE TABLE "seller_leaderboards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "period" "LeaderboardPeriod" NOT NULL,
    "periodKey" VARCHAR(50) NOT NULL,
    "scope" "LeaderboardScope" NOT NULL DEFAULT 'GLOBAL',
    "scopeKey" VARCHAR(50) NOT NULL DEFAULT 'ALL',
    "metric" "ScoreComponent" NOT NULL DEFAULT 'TOTAL',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "premium_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" "PremiumFeatureCode" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" VARCHAR(50),
    "durationDays" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_premium_access" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "source" VARCHAR(60),
    "reason" VARCHAR(255),
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_premium_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_rewards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "type" "RewardType" NOT NULL,
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "title" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "value" INTEGER,
    "currency" VARCHAR(10) DEFAULT 'MGA',
    "featureId" UUID,
    "leaderboardEntryId" UUID,
    "achievementAwardId" UUID,
    "grantedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" "AchievementCode" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" VARCHAR(50),
    "rarity" "AchievementRarity" NOT NULL DEFAULT 'COMMON',
    "points" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_achievement_awards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "achievementId" UUID NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodKey" VARCHAR(50) NOT NULL DEFAULT 'LIFETIME',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_achievement_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_promotions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "discountPercent" INTEGER,
    "discountAmount" INTEGER,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "minOrderAmount" INTEGER,
    "source" VARCHAR(60),
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderNumber" VARCHAR(50) NOT NULL,
    "userId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'MGA',
    "deliveryMode" "DeliveryMode" NOT NULL,
    "shippingFullName" VARCHAR(120) NOT NULL,
    "shippingPhone" VARCHAR(30) NOT NULL,
    "shippingEmail" VARCHAR(120) NOT NULL,
    "shippingProvince" "ProvinceMadagascar" NOT NULL,
    "shippingRegion" "RegionMadagascar" NOT NULL,
    "shippingCity" VARCHAR(100) NOT NULL,
    "shippingNeighborhood" VARCHAR(100),
    "shippingAddress" VARCHAR(255) NOT NULL,
    "shippingNotes" VARCHAR(255),
    "deliveryLatitude" DOUBLE PRECISION,
    "deliveryLongitude" DOUBLE PRECISION,
    "deliveryAccuracy" DOUBLE PRECISION,
    "deliveryGpsSharedAt" TIMESTAMP(3),
    "shippingZoneId" UUID,
    "shippingPickupPointId" UUID,
    "subtotal" INTEGER NOT NULL,
    "shippingCost" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "codAmountExpected" INTEGER,
    "codCollectedAt" TIMESTAMP(3),
    "codCollectedBy" VARCHAR(100),
    "paidAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "reviewRequestedAt" TIMESTAMP(3),
    "stockReservedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "boutiqueId" UUID,
    "titleSnapshot" VARCHAR(200) NOT NULL,
    "imageSnapshot" VARCHAR(500),
    "skuSnapshot" VARCHAR(50) NOT NULL,
    "priceSnapshot" INTEGER NOT NULL,
    "colorSnapshot" VARCHAR(50),
    "sizeSnapshot" VARCHAR(50),
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "label" VARCHAR(60) NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(120),
    "province" "ProvinceMadagascar" NOT NULL,
    "region" "RegionMadagascar" NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "neighborhood" VARCHAR(100),
    "address" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accuracyMeters" DOUBLE PRECISION,
    "notes" VARCHAR(255),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "pickupPointId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_points" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "provider" VARCHAR(60) NOT NULL,
    "phone" VARCHAR(30),
    "email" VARCHAR(120),
    "province" "ProvinceMadagascar" NOT NULL,
    "region" "RegionMadagascar" NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "shippingZoneId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "province" "ProvinceMadagascar",
    "regions" "RegionMadagascar"[],
    "basePrice" INTEGER NOT NULL,
    "pricePerKg" INTEGER,
    "estimatedDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'MGA',
    "method" "PaymentMethod" NOT NULL,
    "provider" "MobileMoneyProvider",
    "status" "TransactionStatus" NOT NULL,
    "externalId" VARCHAR(120),
    "externalRequestId" VARCHAR(120),
    "idempotencyKey" VARCHAR(128) NOT NULL,
    "rawCallback" JSONB,
    "signatureVerified" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhooks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" "MobileMoneyProvider" NOT NULL,
    "externalId" VARCHAR(120),
    "eventType" VARCHAR(80) NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "signature" VARCHAR(255),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorMessage" VARCHAR(255),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sellerId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "type" "SellerContractType" NOT NULL,
    "value" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'MGA',
    "status" "SellerContractStatus" NOT NULL DEFAULT 'PENDING',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "rejectionReason" VARCHAR(255),
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "reviewNote" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "settlementId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'MGA',
    "idempotencyKey" VARCHAR(128) NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "externalReference" VARCHAR(120),
    "failureReason" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transfer_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_localizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL,
    "locale" "ContentLocale" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "shortDescription" VARCHAR(300),
    "description" TEXT,
    "longDescription" TEXT,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "focusKeyword" VARCHAR(80),
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canonicalUrl" VARCHAR(255),
    "ogImageUrl" VARCHAR(500),
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

-- CreateTable
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
    "canonicalUrl" VARCHAR(255),
    "ogImageUrl" VARCHAR(500),
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boutique_localizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boutique_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "boutiqueId" UUID NOT NULL,
    "locale" "ContentLocale" NOT NULL DEFAULT 'FR',
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "excerpt" VARCHAR(300),
    "content" TEXT NOT NULL,
    "coverUrl" VARCHAR(500),
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

-- CreateTable
CREATE TABLE "slug_redirects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entityType" "SeoEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "oldSlug" VARCHAR(160) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slug_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "seo_issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auditId" UUID NOT NULL,
    "code" "SeoIssueCode" NOT NULL,
    "severity" "SeoIssueSeverity" NOT NULL,
    "field" VARCHAR(60),
    "message" VARCHAR(255),

    CONSTRAINT "seo_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "siteName" VARCHAR(100) NOT NULL DEFAULT 'Lurevia',
    "siteTagline" VARCHAR(160),
    "siteDescription" TEXT,
    "contactEmail" VARCHAR(120),
    "contactPhone" VARCHAR(30),
    "contactAddress" VARCHAR(255),
    "defaultCurrency" VARCHAR(10) NOT NULL DEFAULT 'MGA',
    "logoUrl" VARCHAR(500),
    "faviconUrl" VARCHAR(500),
    "primaryColor" VARCHAR(10) NOT NULL DEFAULT '#2F7BF6',
    "secondaryColor" VARCHAR(10) NOT NULL DEFAULT '#0A1B3D',
    "accentColor" VARCHAR(10),
    "facebookUrl" VARCHAR(255),
    "instagramUrl" VARCHAR(255),
    "tiktokUrl" VARCHAR(255),
    "whatsappNumber" VARCHAR(30),
    "linkedinUrl" VARCHAR(255),
    "privacyPolicy" TEXT NOT NULL DEFAULT '',
    "termsOfService" TEXT NOT NULL DEFAULT '',
    "cookieMessage" VARCHAR(255) NOT NULL DEFAULT '',
    "legalCompanyName" VARCHAR(160),
    "legalRegistrationNumber" VARCHAR(60),
    "freeShippingThreshold" INTEGER NOT NULL DEFAULT 250000,
    "defaultShippingCost" INTEGER NOT NULL DEFAULT 8000,
    "homeDeliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pickupPointEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enableMVola" BOOLEAN NOT NULL DEFAULT true,
    "enableCOD" BOOLEAN NOT NULL DEFAULT true,
    "enableCard" BOOLEAN NOT NULL DEFAULT false,
    "enableBankTransfer" BOOLEAN NOT NULL DEFAULT false,
    "codMaxAmount" INTEGER DEFAULT 500000,
    "requireCinForSellers" BOOLEAN NOT NULL DEFAULT true,
    "requireCinForCOD" BOOLEAN NOT NULL DEFAULT false,
    "cinVerificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "allowMinorWithGuardian" BOOLEAN NOT NULL DEFAULT true,
    "minorAgeThreshold" INTEGER NOT NULL DEFAULT 18,
    "auctionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "auctionMinIncrement" INTEGER NOT NULL DEFAULT 1000,
    "auctionAutoExtendMinutes" INTEGER NOT NULL DEFAULT 2,
    "auctionDefaultDurationH" INTEGER NOT NULL DEFAULT 24,
    "auctionChatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "auctionChatModeration" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" VARCHAR(255),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_identity_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "siteName" VARCHAR(100) NOT NULL DEFAULT 'Lurevia',
    "tagline" VARCHAR(160),
    "description" TEXT,
    "contactEmail" VARCHAR(120),
    "contactPhone" VARCHAR(30),
    "companyName" VARCHAR(160),
    "companyAddress" VARCHAR(255),
    "companyRegistration" VARCHAR(60),
    "defaultLocale" VARCHAR(10) NOT NULL DEFAULT 'fr',
    "defaultCurrency" VARCHAR(10) NOT NULL DEFAULT 'MGA',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Indian/Antananarivo',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "site_identity_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "logoUrl" VARCHAR(500),
    "faviconUrl" VARCHAR(500),
    "primaryColor" VARCHAR(10) NOT NULL DEFAULT '#000000',
    "secondaryColor" VARCHAR(10) NOT NULL DEFAULT '#FFFFFF',
    "accentColor" VARCHAR(10),
    "backgroundColor" VARCHAR(10),
    "textColor" VARCHAR(10),
    "fontFamily" VARCHAR(60),
    "darkModeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "theme_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "label" VARCHAR(60),
    "url" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "defaultTitle" VARCHAR(70),
    "titleTemplate" VARCHAR(100),
    "defaultDescription" VARCHAR(160),
    "defaultKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "defaultOgImageUrl" VARCHAR(500),
    "canonicalBaseUrl" VARCHAR(255),
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "seo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "message" VARCHAR(255),
    "expectedEndAt" TIMESTAMP(3),
    "allowAdminAccess" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "maintenance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "provider" "DocumentProvider" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'fr',
    "title" VARCHAR(140) NOT NULL,
    "description" VARCHAR(255),
    "documentUrl" VARCHAR(500) NOT NULL,
    "externalDocumentId" VARCHAR(120),
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "shippingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "freeShippingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "freeShippingMinAmount" DECIMAL(12,2),
    "defaultShippingFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estimatedMinDays" INTEGER,
    "estimatedMaxDays" INTEGER,
    "allowShippingCalculation" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "cashOnDelivery" BOOLEAN NOT NULL DEFAULT true,
    "mobileMoney" BOOLEAN NOT NULL DEFAULT false,
    "bankTransfer" BOOLEAN NOT NULL DEFAULT false,
    "cardPayment" BOOLEAN NOT NULL DEFAULT false,
    "codMaxAmount" DECIMAL(12,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "payment_method_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_verification_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "verificationRequired" BOOLEAN NOT NULL DEFAULT true,
    "cinVerificationRequired" BOOLEAN NOT NULL DEFAULT true,
    "manualReviewRequired" BOOLEAN NOT NULL DEFAULT true,
    "allowUnverifiedSelling" BOOLEAN NOT NULL DEFAULT false,
    "requireVerifiedForPayout" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "seller_verification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "auctionsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minimumDurationHours" INTEGER NOT NULL DEFAULT 24,
    "maximumDurationDays" INTEGER NOT NULL DEFAULT 14,
    "minimumIncrement" DECIMAL(12,2) NOT NULL DEFAULT 1000,
    "requireVerifiedSeller" BOOLEAN NOT NULL DEFAULT true,
    "requireVerifiedBuyer" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "auction_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "orderNotifications" BOOLEAN NOT NULL DEFAULT true,
    "paymentNotifications" BOOLEAN NOT NULL DEFAULT true,
    "shippingNotifications" BOOLEAN NOT NULL DEFAULT true,
    "sellerNotifications" BOOLEAN NOT NULL DEFAULT true,
    "adminNotifications" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings_audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" UUID,
    "domain" "SettingsDomain" NOT NULL,
    "settingId" VARCHAR(50),
    "action" "SettingsAuditAction" NOT NULL,
    "changes" JSONB,
    "requestId" VARCHAR(120),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(140) NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(500),
    "referenceKey" VARCHAR(120) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipientId" UUID NOT NULL,
    "senderId" UUID,
    "type" "MessageType" NOT NULL DEFAULT 'ADMIN_MESSAGE',
    "subject" VARCHAR(160) NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "AdminNotificationType" NOT NULL,
    "title" VARCHAR(140) NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" VARCHAR(60) NOT NULL,
    "entityId" VARCHAR(60) NOT NULL,
    "actorUserId" UUID,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(120) NOT NULL,
    "confirmationToken" VARCHAR(128),
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "unsubscribeReason" VARCHAR(255),
    "createdByIp" VARCHAR(45),
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actorUserId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(60) NOT NULL,
    "entityId" VARCHAR(60),
    "metadata" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "job_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(80) NOT NULL,
    "runKey" VARCHAR(60) NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "processed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "meta" JSONB,

    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(80) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "showInFooter" BOOLEAN NOT NULL DEFAULT false,
    "footerSection" VARCHAR(20),
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30),
    "avatarUrl" VARCHAR(500),
    "age" INTEGER,
    "gender" "Gender",
    "isPrimaryAdmin" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" VARCHAR(255),
    "passwordChangedAt" TIMESTAMP(3),
    "primaryIdentifier" "AuthIdentifier" NOT NULL DEFAULT 'EMAIL',
    "primaryProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "cinNumber" VARCHAR(30),
    "cinVerifiedAt" TIMESTAMP(3),
    "identityDocumentType" "IdentityDocumentType",
    "identityDocumentNumber" VARCHAR(60),
    "identityDocumentUrl" TEXT,
    "identityVerifiedAt" TIMESTAMP(3),
    "identityVerificationStatus" "IdentityVerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "identityRejectionReason" VARCHAR(255),
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "guardianFullName" VARCHAR(120),
    "guardianCinNumber" VARCHAR(30),
    "guardianPhone" VARCHAR(30),
    "guardianEmail" VARCHAR(120),
    "guardianRelation" "GuardianRelation",
    "guardianCinDocumentUrl" TEXT,
    "guardianCinVerifiedAt" TIMESTAMP(3),
    "guardianConsentGivenAt" TIMESTAMP(3),
    "guardianConsentIp" VARCHAR(45),
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_guardians" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "fullName" VARCHAR(120),
    "cinNumber" VARCHAR(30),
    "phone" VARCHAR(30),
    "email" VARCHAR(120),
    "relation" "GuardianRelation",
    "cinDocumentUrl" TEXT,
    "cinVerifiedAt" TIMESTAMP(3),
    "consentGivenAt" TIMESTAMP(3),
    "consentIp" VARCHAR(45),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "status" "IdentityVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "documentType" "IdentityDocumentType",
    "documentNumber" VARCHAR(60),
    "documentUrl" TEXT,
    "documentUrlBack" TEXT,
    "selfieUrl" TEXT,
    "cinNumber" VARCHAR(30),
    "isGuardianVerification" BOOLEAN NOT NULL DEFAULT false,
    "guardianFullName" VARCHAR(120),
    "guardianCinNumber" VARCHAR(30),
    "guardianRelation" "GuardianRelation",
    "guardianCinDocumentUrl" TEXT,
    "guardianPhone" VARCHAR(30),
    "guardianConsentProofUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" UUID,
    "rejectionReason" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" VARCHAR(120) NOT NULL,
    "providerEmail" VARCHAR(120),
    "providerName" VARCHAR(120),
    "avatarUrl" VARCHAR(500),
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(128) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedById" UUID,
    "createdByIp" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(128) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdByIp" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "codeHash" VARCHAR(128),
    "expiresAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" VARCHAR(100),
    "usedAt" TIMESTAMP(3),
    "reason" VARCHAR(160),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_deletion_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "reason" VARCHAR(255),
    "status" "DeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "account_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_change_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "requestedFullName" VARCHAR(120),
    "requestedEmail" VARCHAR(120),
    "requestedPhone" VARCHAR(30),
    "status" "ProfileChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" VARCHAR(255),
    "reviewedBy" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "profile_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auctions_productId_key" ON "auctions"("productId");

-- CreateIndex
CREATE INDEX "auctions_status_endAt_idx" ON "auctions"("status", "endAt");

-- CreateIndex
CREATE INDEX "auctions_startAt_idx" ON "auctions"("startAt");

-- CreateIndex
CREATE INDEX "product_bids_productId_proposedPrice_idx" ON "product_bids"("productId", "proposedPrice" DESC);

-- CreateIndex
CREATE INDEX "product_bids_userId_idx" ON "product_bids"("userId");

-- CreateIndex
CREATE INDEX "product_bids_productId_status_idx" ON "product_bids"("productId", "status");

-- CreateIndex
CREATE INDEX "product_bids_productId_isWinningBid_idx" ON "product_bids"("productId", "isWinningBid");

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
CREATE UNIQUE INDEX "boutiques_ownerId_key" ON "boutiques"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "boutiques_name_key" ON "boutiques"("name");

-- CreateIndex
CREATE UNIQUE INDEX "boutiques_slug_key" ON "boutiques"("slug");

-- CreateIndex
CREATE INDEX "boutiques_storeCategoryId_idx" ON "boutiques"("storeCategoryId");

-- CreateIndex
CREATE INDEX "boutiques_tier_idx" ON "boutiques"("tier");

-- CreateIndex
CREATE INDEX "boutiques_isActive_deletedAt_idx" ON "boutiques"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "boutiques_isFeatured_idx" ON "boutiques"("isFeatured");

-- CreateIndex
CREATE INDEX "boutiques_scoreTotal_idx" ON "boutiques"("scoreTotal" DESC);

-- CreateIndex
CREATE INDEX "boutiques_ratingCache_idx" ON "boutiques"("ratingCache" DESC);

-- CreateIndex
CREATE INDEX "boutiques_subscriberCountCache_idx" ON "boutiques"("subscriberCountCache" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "boutique_profiles_boutiqueId_key" ON "boutique_profiles"("boutiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "boutique_contacts_boutiqueId_key" ON "boutique_contacts"("boutiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "boutique_locations_boutiqueId_key" ON "boutique_locations"("boutiqueId");

-- CreateIndex
CREATE INDEX "boutique_locations_province_region_idx" ON "boutique_locations"("province", "region");

-- CreateIndex
CREATE UNIQUE INDEX "boutique_legals_boutiqueId_key" ON "boutique_legals"("boutiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "boutique_policies_boutiqueId_key" ON "boutique_policies"("boutiqueId");

-- CreateIndex
CREATE INDEX "managed_boutiques_boutiqueId_idx" ON "managed_boutiques"("boutiqueId");

-- CreateIndex
CREATE INDEX "subscriptions_boutiqueId_idx" ON "subscriptions"("boutiqueId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_boutiqueId_key" ON "subscriptions"("userId", "boutiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "categories_isActive_position_idx" ON "categories"("isActive", "position");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_boutiqueId_isActive_deletedAt_idx" ON "products"("boutiqueId", "isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "products_pricingMode_auctionStatus_idx" ON "products"("pricingMode", "auctionStatus");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_stock_idx" ON "products"("stock");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- CreateIndex
CREATE INDEX "product_images_productId_position_idx" ON "product_images"("productId", "position");

-- CreateIndex
CREATE INDEX "product_colors_productId_idx" ON "product_colors"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_sizes_productId_value_key" ON "product_sizes"("productId", "value");

-- CreateIndex
CREATE INDEX "product_categories_categoryId_idx" ON "product_categories"("categoryId");

-- CreateIndex
CREATE INDEX "product_attributes_key_value_idx" ON "product_attributes"("key", "value");

-- CreateIndex
CREATE UNIQUE INDEX "product_attributes_productId_key_key" ON "product_attributes"("productId", "key");

-- CreateIndex
CREATE INDEX "product_faqs_productId_locale_idx" ON "product_faqs"("productId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "product_tags_tagId_idx" ON "product_tags"("tagId");

-- CreateIndex
CREATE INDEX "cart_items_userId_idx" ON "cart_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_productId_colorId_sizeId_key" ON "cart_items"("userId", "productId", "colorId", "sizeId");

-- CreateIndex
CREATE INDEX "favorite_items_userId_idx" ON "favorite_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_items_userId_productId_key" ON "favorite_items"("userId", "productId");

-- CreateIndex
CREATE INDEX "product_deletion_requests_status_createdAt_idx" ON "product_deletion_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "product_deletion_requests_sellerId_status_idx" ON "product_deletion_requests"("sellerId", "status");

-- CreateIndex
CREATE INDEX "product_deletion_requests_productId_status_idx" ON "product_deletion_requests"("productId", "status");

-- CreateIndex
CREATE INDEX "feedbacks_productId_isApproved_idx" ON "feedbacks"("productId", "isApproved");

-- CreateIndex
CREATE INDEX "feedbacks_boutiqueId_isApproved_idx" ON "feedbacks"("boutiqueId", "isApproved");

-- CreateIndex
CREATE INDEX "feedbacks_userId_type_idx" ON "feedbacks"("userId", "type");

-- CreateIndex
CREATE INDEX "feedbacks_type_isApproved_createdAt_idx" ON "feedbacks"("type", "isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "feedbacks_orderId_idx" ON "feedbacks"("orderId");

-- CreateIndex
CREATE INDEX "feedbacks_deletedAt_idx" ON "feedbacks"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_userId_productId_key" ON "feedbacks"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_userId_boutiqueId_key" ON "feedbacks"("userId", "boutiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_userId_period_key" ON "feedbacks"("userId", "period");

-- CreateIndex
CREATE INDEX "product_daily_stats_boutiqueId_date_idx" ON "product_daily_stats"("boutiqueId", "date");

-- CreateIndex
CREATE INDEX "product_daily_stats_date_idx" ON "product_daily_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "product_daily_stats_productId_date_key" ON "product_daily_stats"("productId", "date");

-- CreateIndex
CREATE INDEX "boutique_daily_stats_date_idx" ON "boutique_daily_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "boutique_daily_stats_boutiqueId_date_key" ON "boutique_daily_stats"("boutiqueId", "date");

-- CreateIndex
CREATE INDEX "search_term_daily_stats_date_searches_idx" ON "search_term_daily_stats"("date", "searches" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "search_term_daily_stats_term_locale_date_key" ON "search_term_daily_stats"("term", "locale", "date");

-- CreateIndex
CREATE INDEX "seller_stats_period_periodKey_scoreTotal_idx" ON "seller_stats"("period", "periodKey", "scoreTotal" DESC);

-- CreateIndex
CREATE INDEX "seller_stats_period_periodKey_rank_idx" ON "seller_stats"("period", "periodKey", "rank");

-- CreateIndex
CREATE INDEX "seller_stats_boutiqueId_period_idx" ON "seller_stats"("boutiqueId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "seller_stats_boutiqueId_period_periodKey_key" ON "seller_stats"("boutiqueId", "period", "periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "scoring_rule_sets_version_key" ON "scoring_rule_sets"("version");

-- CreateIndex
CREATE INDEX "scoring_rule_sets_isActive_idx" ON "scoring_rule_sets"("isActive");

-- CreateIndex
CREATE INDEX "seller_score_snapshots_period_periodKey_scoreTotal_idx" ON "seller_score_snapshots"("period", "periodKey", "scoreTotal" DESC);

-- CreateIndex
CREATE INDEX "seller_score_snapshots_boutiqueId_period_idx" ON "seller_score_snapshots"("boutiqueId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "seller_score_snapshots_boutiqueId_period_periodKey_ruleSetI_key" ON "seller_score_snapshots"("boutiqueId", "period", "periodKey", "ruleSetId");

-- CreateIndex
CREATE INDEX "seller_leaderboards_period_periodKey_scope_idx" ON "seller_leaderboards"("period", "periodKey", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "seller_leaderboards_period_periodKey_scope_scopeKey_metric_key" ON "seller_leaderboards"("period", "periodKey", "scope", "scopeKey", "metric");

-- CreateIndex
CREATE INDEX "seller_leaderboard_entries_leaderboardId_rank_idx" ON "seller_leaderboard_entries"("leaderboardId", "rank");

-- CreateIndex
CREATE INDEX "seller_leaderboard_entries_boutiqueId_idx" ON "seller_leaderboard_entries"("boutiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_leaderboard_entries_leaderboardId_boutiqueId_key" ON "seller_leaderboard_entries"("leaderboardId", "boutiqueId");

-- CreateIndex
CREATE UNIQUE INDEX "premium_features_code_key" ON "premium_features"("code");

-- CreateIndex
CREATE INDEX "seller_premium_access_boutiqueId_isActive_idx" ON "seller_premium_access"("boutiqueId", "isActive");

-- CreateIndex
CREATE INDEX "seller_premium_access_featureId_isActive_idx" ON "seller_premium_access"("featureId", "isActive");

-- CreateIndex
CREATE INDEX "seller_premium_access_expiresAt_idx" ON "seller_premium_access"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "seller_rewards_leaderboardEntryId_key" ON "seller_rewards"("leaderboardEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_rewards_achievementAwardId_key" ON "seller_rewards"("achievementAwardId");

-- CreateIndex
CREATE INDEX "seller_rewards_boutiqueId_status_idx" ON "seller_rewards"("boutiqueId", "status");

-- CreateIndex
CREATE INDEX "seller_rewards_type_status_idx" ON "seller_rewards"("type", "status");

-- CreateIndex
CREATE INDEX "seller_rewards_expiresAt_idx" ON "seller_rewards"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "seller_achievement_awards_boutiqueId_idx" ON "seller_achievement_awards"("boutiqueId");

-- CreateIndex
CREATE INDEX "seller_achievement_awards_achievementId_idx" ON "seller_achievement_awards"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_achievement_awards_boutiqueId_achievementId_periodKe_key" ON "seller_achievement_awards"("boutiqueId", "achievementId", "periodKey");

-- CreateIndex
CREATE UNIQUE INDEX "seller_promotions_code_key" ON "seller_promotions"("code");

-- CreateIndex
CREATE INDEX "seller_promotions_boutiqueId_isActive_idx" ON "seller_promotions"("boutiqueId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE INDEX "order_items_boutiqueId_idx" ON "order_items"("boutiqueId");

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE INDEX "addresses_province_region_idx" ON "addresses"("province", "region");

-- CreateIndex
CREATE INDEX "pickup_points_province_region_idx" ON "pickup_points"("province", "region");

-- CreateIndex
CREATE INDEX "pickup_points_provider_idx" ON "pickup_points"("provider");

-- CreateIndex
CREATE INDEX "pickup_points_isActive_idx" ON "pickup_points"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_zones_name_key" ON "shipping_zones"("name");

-- CreateIndex
CREATE INDEX "shipping_zones_province_idx" ON "shipping_zones"("province");

-- CreateIndex
CREATE INDEX "delivery_tracking_orderId_recordedAt_idx" ON "delivery_tracking"("orderId", "recordedAt");

-- CreateIndex
CREATE INDEX "delivery_tracking_courierId_recordedAt_idx" ON "delivery_tracking"("courierId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_externalId_key" ON "transactions"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_idempotencyKey_key" ON "transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "transactions_orderId_idx" ON "transactions"("orderId");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "payment_webhooks_provider_externalId_idx" ON "payment_webhooks"("provider", "externalId");

-- CreateIndex
CREATE INDEX "payment_webhooks_processedAt_idx" ON "payment_webhooks"("processedAt");

-- CreateIndex
CREATE INDEX "seller_contracts_sellerId_status_effectiveFrom_idx" ON "seller_contracts"("sellerId", "status", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "seller_contracts_sellerId_version_key" ON "seller_contracts"("sellerId", "version");

-- CreateIndex
CREATE INDEX "seller_settlements_sellerId_status_createdAt_idx" ON "seller_settlements"("sellerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "seller_settlements_orderId_idx" ON "seller_settlements"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "seller_settlements_orderId_sellerId_key" ON "seller_settlements"("orderId", "sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_ledger_idempotencyKey_key" ON "transfer_ledger"("idempotencyKey");

-- CreateIndex
CREATE INDEX "transfer_ledger_sellerId_status_createdAt_idx" ON "transfer_ledger"("sellerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "transfer_ledger_settlementId_idx" ON "transfer_ledger"("settlementId");

-- CreateIndex
CREATE INDEX "product_localizations_locale_moderationStatus_idx" ON "product_localizations"("locale", "moderationStatus");

-- CreateIndex
CREATE INDEX "product_localizations_contentHash_idx" ON "product_localizations"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "product_localizations_productId_locale_key" ON "product_localizations"("productId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "boutique_localizations_boutiqueId_locale_key" ON "boutique_localizations"("boutiqueId", "locale");

-- CreateIndex
CREATE INDEX "boutique_posts_status_publishedAt_idx" ON "boutique_posts"("status", "publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "boutique_posts_boutiqueId_slug_key" ON "boutique_posts"("boutiqueId", "slug");

-- CreateIndex
CREATE INDEX "slug_redirects_entityType_entityId_idx" ON "slug_redirects"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "slug_redirects_entityType_oldSlug_key" ON "slug_redirects"("entityType", "oldSlug");

-- CreateIndex
CREATE INDEX "seo_audits_entityType_entityId_isLatest_idx" ON "seo_audits"("entityType", "entityId", "isLatest");

-- CreateIndex
CREATE INDEX "seo_audits_boutiqueId_entityType_isLatest_idx" ON "seo_audits"("boutiqueId", "entityType", "isLatest");

-- CreateIndex
CREATE INDEX "seo_audits_computedAt_idx" ON "seo_audits"("computedAt");

-- CreateIndex
CREATE INDEX "seo_issues_auditId_idx" ON "seo_issues"("auditId");

-- CreateIndex
CREATE INDEX "seo_issues_code_severity_idx" ON "seo_issues"("code", "severity");

-- CreateIndex
CREATE INDEX "social_links_isActive_position_idx" ON "social_links"("isActive", "position");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_platform_label_key" ON "social_links"("platform", "label");

-- CreateIndex
CREATE INDEX "legal_documents_type_locale_status_idx" ON "legal_documents"("type", "locale", "status");

-- CreateIndex
CREATE INDEX "legal_documents_type_locale_isCurrent_idx" ON "legal_documents"("type", "locale", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_type_locale_version_key" ON "legal_documents"("type", "locale", "version");

-- CreateIndex
CREATE INDEX "settings_audit_logs_domain_createdAt_idx" ON "settings_audit_logs"("domain", "createdAt");

-- CreateIndex
CREATE INDEX "settings_audit_logs_actorId_createdAt_idx" ON "settings_audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "settings_audit_logs_settingId_idx" ON "settings_audit_logs"("settingId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_createdAt_idx" ON "notifications"("userId", "read", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_referenceKey_key" ON "notifications"("userId", "referenceKey");

-- CreateIndex
CREATE INDEX "user_messages_recipientId_createdAt_idx" ON "user_messages"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "user_messages_senderId_createdAt_idx" ON "user_messages"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_notifications_read_createdAt_idx" ON "admin_notifications"("read", "createdAt");

-- CreateIndex
CREATE INDEX "admin_notifications_entityType_entityId_idx" ON "admin_notifications"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_confirmationToken_key" ON "newsletter_subscribers"("confirmationToken");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_confirmedAt_idx" ON "newsletter_subscribers"("confirmedAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_createdAt_idx" ON "audit_logs"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "media_assets_ownerId_createdAt_idx" ON "media_assets"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "media_assets_googleArchiveStatus_idx" ON "media_assets"("googleArchiveStatus");

-- CreateIndex
CREATE INDEX "job_runs_name_status_startedAt_idx" ON "job_runs"("name", "status", "startedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "job_runs_name_runKey_key" ON "job_runs"("name", "runKey");

-- CreateIndex
CREATE UNIQUE INDEX "site_pages_slug_key" ON "site_pages"("slug");

-- CreateIndex
CREATE INDEX "site_pages_published_showInFooter_idx" ON "site_pages"("published", "showInFooter");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_cinNumber_key" ON "users"("cinNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_identityDocumentNumber_key" ON "users"("identityDocumentNumber");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "users_identityVerificationStatus_idx" ON "users"("identityVerificationStatus");

-- CreateIndex
CREATE INDEX "users_guardianCinNumber_idx" ON "users"("guardianCinNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_guardians_userId_key" ON "user_guardians"("userId");

-- CreateIndex
CREATE INDEX "user_guardians_cinNumber_idx" ON "user_guardians"("cinNumber");

-- CreateIndex
CREATE INDEX "identity_verifications_userId_status_idx" ON "identity_verifications"("userId", "status");

-- CreateIndex
CREATE INDEX "identity_verifications_status_createdAt_idx" ON "identity_verifications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "identity_verifications_guardianCinNumber_idx" ON "identity_verifications"("guardianCinNumber");

-- CreateIndex
CREATE INDEX "oauth_accounts_userId_idx" ON "oauth_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_providerUserId_key" ON "oauth_accounts"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "verification_requests_userId_idx" ON "verification_requests"("userId");

-- CreateIndex
CREATE INDEX "verification_requests_status_idx" ON "verification_requests"("status");

-- CreateIndex
CREATE INDEX "account_deletion_requests_status_idx" ON "account_deletion_requests"("status");

-- CreateIndex
CREATE INDEX "account_deletion_requests_userId_idx" ON "account_deletion_requests"("userId");

-- CreateIndex
CREATE INDEX "profile_change_requests_userId_status_idx" ON "profile_change_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "profile_change_requests_status_createdAt_idx" ON "profile_change_requests"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_bids" ADD CONSTRAINT "product_bids_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_bids" ADD CONSTRAINT "product_bids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_messages" ADD CONSTRAINT "auction_messages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_messages" ADD CONSTRAINT "auction_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_watchers" ADD CONSTRAINT "auction_watchers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_watchers" ADD CONSTRAINT "auction_watchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutiques" ADD CONSTRAINT "boutiques_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutiques" ADD CONSTRAINT "boutiques_storeCategoryId_fkey" FOREIGN KEY ("storeCategoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique_profiles" ADD CONSTRAINT "boutique_profiles_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique_contacts" ADD CONSTRAINT "boutique_contacts_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique_locations" ADD CONSTRAINT "boutique_locations_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique_legals" ADD CONSTRAINT "boutique_legals_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique_policies" ADD CONSTRAINT "boutique_policies_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managed_boutiques" ADD CONSTRAINT "managed_boutiques_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managed_boutiques" ADD CONSTRAINT "managed_boutiques_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_auctionWinnerId_fkey" FOREIGN KEY ("auctionWinnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sizes" ADD CONSTRAINT "product_sizes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_faqs" ADD CONSTRAINT "product_faqs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "product_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "product_sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_items" ADD CONSTRAINT "favorite_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_items" ADD CONSTRAINT "favorite_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_deletion_requests" ADD CONSTRAINT "product_deletion_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_deletion_requests" ADD CONSTRAINT "product_deletion_requests_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_daily_stats" ADD CONSTRAINT "product_daily_stats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique_daily_stats" ADD CONSTRAINT "boutique_daily_stats_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_stats" ADD CONSTRAINT "seller_stats_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_score_snapshots" ADD CONSTRAINT "seller_score_snapshots_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_score_snapshots" ADD CONSTRAINT "seller_score_snapshots_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "scoring_rule_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_leaderboard_entries" ADD CONSTRAINT "seller_leaderboard_entries_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "seller_leaderboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_leaderboard_entries" ADD CONSTRAINT "seller_leaderboard_entries_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_premium_access" ADD CONSTRAINT "seller_premium_access_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_premium_access" ADD CONSTRAINT "seller_premium_access_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "premium_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_rewards" ADD CONSTRAINT "seller_rewards_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_rewards" ADD CONSTRAINT "seller_rewards_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "premium_features"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_rewards" ADD CONSTRAINT "seller_rewards_leaderboardEntryId_fkey" FOREIGN KEY ("leaderboardEntryId") REFERENCES "seller_leaderboard_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_rewards" ADD CONSTRAINT "seller_rewards_achievementAwardId_fkey" FOREIGN KEY ("achievementAwardId") REFERENCES "seller_achievement_awards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_achievement_awards" ADD CONSTRAINT "seller_achievement_awards_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_achievement_awards" ADD CONSTRAINT "seller_achievement_awards_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_promotions" ADD CONSTRAINT "seller_promotions_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingZoneId_fkey" FOREIGN KEY ("shippingZoneId") REFERENCES "shipping_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingPickupPointId_fkey" FOREIGN KEY ("shippingPickupPointId") REFERENCES "pickup_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_pickupPointId_fkey" FOREIGN KEY ("pickupPointId") REFERENCES "pickup_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_points" ADD CONSTRAINT "pickup_points_shippingZoneId_fkey" FOREIGN KEY ("shippingZoneId") REFERENCES "shipping_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_contracts" ADD CONSTRAINT "seller_contracts_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_settlements" ADD CONSTRAINT "seller_settlements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_settlements" ADD CONSTRAINT "seller_settlements_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_settlements" ADD CONSTRAINT "seller_settlements_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "seller_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_ledger" ADD CONSTRAINT "transfer_ledger_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "seller_settlements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_ledger" ADD CONSTRAINT "transfer_ledger_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_localizations" ADD CONSTRAINT "product_localizations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique_localizations" ADD CONSTRAINT "boutique_localizations_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boutique_posts" ADD CONSTRAINT "boutique_posts_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "boutiques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_audits" ADD CONSTRAINT "seo_audits_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "scoring_rule_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "seo_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_guardians" ADD CONSTRAINT "user_guardians_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_deletion_requests" ADD CONSTRAINT "account_deletion_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_change_requests" ADD CONSTRAINT "profile_change_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
