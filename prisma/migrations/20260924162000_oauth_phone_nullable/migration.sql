ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;
UPDATE "User"
SET "phone" = NULL, "isVerified" = false
WHERE "phone" = 'NOT_PROVIDED';
