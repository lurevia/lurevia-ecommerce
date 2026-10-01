import type { DeletionRequestStatus } from "@prisma/client";

export const DELETION_STATUS_TO_API: Record<DeletionRequestStatus, string> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const DELETION_STATUS_FROM_API: Record<string, DeletionRequestStatus> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};
