import { type RawDeletionRow } from "../lib/type/admin.type";
import { DELETION_STATUS_TO_API } from "../lib/constant/admin.constant";

export class AdminDeletionMapper {
  toOutput(d: RawDeletionRow) {
    return {
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
    };
  }

  toOutputList(items: RawDeletionRow[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const adminDeletionMapper = new AdminDeletionMapper();
