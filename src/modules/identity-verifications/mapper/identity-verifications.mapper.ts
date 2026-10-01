import type { IdentityVerification } from "@prisma/client";

export class IdentityVerificationsMapper {
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO
  // ─────────────────────────────────────────────────────────────────────────────
  toOutput(v: IdentityVerification) {
    return {
      id: v.id,
      userId: v.userId,
      status: v.status,
      isGuardian: v.isGuardianVerification,

      guardianFullName: v.guardianFullName,
      guardianRelation: v.guardianRelation,
      guardianPhone: v.guardianPhone,

      // Audit
      rejectionReason: v.rejectionReason,
      submittedAt: v.submittedAt,
      reviewedAt: v.reviewedAt,

      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }

  toOutputList(items: IdentityVerification[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const identityVerificationsMapper = new IdentityVerificationsMapper();
