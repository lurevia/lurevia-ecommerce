ALTER TABLE "users"
ADD COLUMN "isPrimaryAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "storeCategoryId" UUID;

ALTER TABLE "users"
ADD CONSTRAINT "users_storeCategoryId_fkey"
FOREIGN KEY ("storeCategoryId") REFERENCES "categories"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "users_storeCategoryId_idx" ON "users"("storeCategoryId");
CREATE UNIQUE INDEX "users_single_primary_admin_idx"
ON "users"("isPrimaryAdmin") WHERE "isPrimaryAdmin" = true;

WITH preferred_categories AS (
	SELECT DISTINCT ON (product."ownerId")
		product."ownerId",
		product_category."categoryId"
	FROM "products" AS product
	JOIN "product_categories" AS product_category
		ON product_category."productId" = product."id"
	WHERE product."ownerId" IS NOT NULL
	ORDER BY product."ownerId", product."createdAt", product."id", product_category."categoryId"
)
UPDATE "users" AS seller
SET "storeCategoryId" = preferred_categories."categoryId"
FROM preferred_categories
WHERE seller."id" = preferred_categories."ownerId"
	AND seller."role" = 'SELLER'
	AND seller."storeCategoryId" IS NULL;

DELETE FROM "product_categories" AS product_category
USING "products" AS product, "users" AS seller
WHERE product_category."productId" = product."id"
	AND product."ownerId" = seller."id"
	AND seller."storeCategoryId" IS NOT NULL
	AND product_category."categoryId" <> seller."storeCategoryId";

INSERT INTO "product_categories" ("productId", "categoryId")
SELECT product."id", seller."storeCategoryId"
FROM "products" AS product
JOIN "users" AS seller ON seller."id" = product."ownerId"
WHERE seller."role" = 'SELLER'
	AND seller."storeCategoryId" IS NOT NULL
ON CONFLICT ("productId", "categoryId") DO NOTHING;

ALTER TABLE "users"
ADD CONSTRAINT "users_primary_admin_role_check"
CHECK (NOT "isPrimaryAdmin" OR "role" = 'ADMIN');