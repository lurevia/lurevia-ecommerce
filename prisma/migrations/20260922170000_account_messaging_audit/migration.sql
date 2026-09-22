CREATE TYPE "ProfileChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "MessageType" AS ENUM ('ADMIN_MESSAGE');
ALTER TYPE "AdminNotificationType" ADD VALUE 'PROFILE_CHANGE_REQUEST';

CREATE TABLE "profile_change_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "requestedFullName" TEXT,
  "requestedEmail" TEXT,
  "requestedPhone" TEXT,
  "status" "ProfileChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
  "adminNote" TEXT,
  "reviewedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "profile_change_requests_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "user_messages" (
  "id" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "senderId" TEXT,
  "type" "MessageType" NOT NULL DEFAULT 'ADMIN_MESSAGE',
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_messages_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "profile_change_requests_userId_status_idx" ON "profile_change_requests"("userId","status");
CREATE INDEX "profile_change_requests_status_createdAt_idx" ON "profile_change_requests"("status","createdAt");
CREATE INDEX "user_messages_recipientId_createdAt_idx" ON "user_messages"("recipientId","createdAt");
CREATE INDEX "user_messages_senderId_createdAt_idx" ON "user_messages"("senderId","createdAt");
CREATE INDEX "audit_logs_actorUserId_createdAt_idx" ON "audit_logs"("actorUserId","createdAt");
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType","entityId");
ALTER TABLE "profile_change_requests" ADD CONSTRAINT "profile_change_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
