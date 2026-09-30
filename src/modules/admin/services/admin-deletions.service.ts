import type { DeletionRequestStatus } from "@prisma/client";
import { adminRepository } from "../admin.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import type {
  ListDeletionRequestsQuery,
  ProcessDeletionRequestInput,
} from "../admin.validators";

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

export const toDeletionRequestDto = (d: RawDeletionRow) => ({
  id: d.id,
  userId: d.userId,
  userName: d.user.fullName,
  userEmail: d.user.email ?? undefined,
  userPhone: d.user.phone ?? undefined,
  userAvatarUrl: d.user.avatarUrl ?? undefined,
  reason: d.reason ?? undefined,
  status: DELETION_STATUS_TO_API[d.status],
  adminNote: d.adminNote ?? undefined,
  createdAt: d.createdAt.toISOString(),
  processedAt: d.processedAt?.toISOString(),
});

export const adminDeletionsService = {
  async listDeletionRequests(query: ListDeletionRequestsQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [requests, totalItems] =
      await adminRepository.findManyDeletionRequests({
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        status: query.status ? DELETION_STATUS_FROM_API[query.status] : undefined,
        search: query.search,
      });
    return buildPaginatedResult(
      requests.map(toDeletionRequestDto),
      totalItems,
      pagination
    );
  },

  async approveDeletionRequest(id: string, input: ProcessDeletionRequestInput) {
    const request = await adminRepository.findDeletionRequestById(id);
    if (!request) throw new NotFoundError("Demande de suppression");
    if (request.status !== "PENDING") {
      throw new ConflictError("Cette demande a déjà été traitée.");
    }
    const updated = await adminRepository.updateDeletionRequestStatus(
      id,
      "APPROVED",
      input.adminNote
    );
    const user = await adminRepository.findUserById(request.userId);
    return toDeletionRequestDto({ ...updated, user: user! });
  },

  async rejectDeletionRequest(id: string, input: ProcessDeletionRequestInput) {
    const request = await adminRepository.findDeletionRequestById(id);
    if (!request) throw new NotFoundError("Demande de suppression");
    if (request.status !== "PENDING") {
      throw new ConflictError("Cette demande a déjà été traitée.");
    }
    const updated = await adminRepository.updateDeletionRequestStatus(
      id,
      "REJECTED",
      input.adminNote
    );
    const user = await adminRepository.findUserById(request.userId);
    return toDeletionRequestDto({ ...updated, user: user! });
  },
};
