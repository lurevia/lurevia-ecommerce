import { adminRepository, type AdminRepository } from "../repository/admin.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import type { ListDeletionRequestsQuery, ProcessDeletionRequestInput } from "../dto";
import { DELETION_STATUS_FROM_API } from "../lib/constant/admin.constant";
import { adminDeletionMapper } from "../mapper/admin-deletions.mapper";

export class AdminDeletionsService {
    constructor(
        private readonly repository: AdminRepository
    ) { }

    async listDeletionRequests(query: ListDeletionRequestsQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [requests, totalItems] =
            await this.repository.findManyDeletionRequests({
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
                status: query.status ? DELETION_STATUS_FROM_API[query.status] : undefined,
                search: query.search,
            });
        return buildPaginatedResult(
            adminDeletionMapper.toOutputList(requests),
            totalItems,
            pagination
        );
    }

    async approveDeletionRequest(id: string, input: ProcessDeletionRequestInput) {
        const request = await this.repository.findDeletionRequestById(id);
        if (!request) throw new NotFoundError("Demande de suppression");
        if (request.status !== "PENDING") {
            throw new ConflictError("Cette demande a déjà été traitée.");
        }
        const updated = await this.repository.updateDeletionRequestStatus(
            id,
            "APPROVED",
            input.adminNote
        );
        const user = await this.repository.findUserById(request.userId);
        return adminDeletionMapper.toOutput({ ...updated, user: user! });
    }

    async rejectDeletionRequest(id: string, input: ProcessDeletionRequestInput) {
        const request = await this.repository.findDeletionRequestById(id);
        if (!request) throw new NotFoundError("Demande de suppression");
        if (request.status !== "PENDING") {
            throw new ConflictError("Cette demande a déjà été traitée.");
        }
        const updated = await this.repository.updateDeletionRequestStatus(
            id,
            "REJECTED",
            input.adminNote
        );
        const user = await this.repository.findUserById(request.userId);
        return adminDeletionMapper.toOutput({ ...updated, user: user! });
    }
}

export const adminDeletionsService = new AdminDeletionsService(adminRepository);
