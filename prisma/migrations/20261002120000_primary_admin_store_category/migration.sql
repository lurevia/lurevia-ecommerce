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

ALTER TABLE "users"
ADD CONSTRAINT "users_primary_admin_role_check"
CHECK (NOT "isPrimaryAdmin" OR "role" = 'ADMIN');