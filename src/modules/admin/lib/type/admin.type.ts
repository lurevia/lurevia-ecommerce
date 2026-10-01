import type { AdminNotificationType, DeletionRequestStatus, IdentityVerificationStatus } from "@prisma/client";

export interface CreateAdminNotificationInput {
  type: AdminNotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  actorUserId?: string;
}

export interface RawDeletionRow {
  id: string;
  userId: string;
  reason: string | null;
  status: DeletionRequestStatus;
  adminNote: string | null;
  createdAt: Date;
  processedAt: Date | null;
  user: {
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl?: string | null;
  };
}

export interface IdentityListQuery {
  status?: IdentityVerificationStatus;
  isGuardian?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RawReviewRow {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: { fullName: string; email: string | null; avatarUrl: string | null; };
  product: { title: string; };
}

export interface RawUserRow {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  age: number | null;
  gender: string | null;
  isVerified: boolean;
  isActive: boolean;
  _count: { orders: number; };
}

export type VerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "USED"
  | "EXPIRED";
