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

      // Personnel
      documentType: v.documentType,
      documentNumber: v.documentNumber,
      cinNumber: v.cinNumber,
      documentUrl: v.documentUrl,
      documentUrlBack: v.documentUrlBack,
      selfieUrl: v.selfieUrl,

      // Tuteur
      guardianFullName: v.guardianFullName,
      guardianCinNumber: v.guardianCinNumber,
      guardianRelation: v.guardianRelation,
      guardianPhone: v.guardianPhone,
      guardianCinDocumentUrl: v.guardianCinDocumentUrl,
      guardianConsentProofUrl: v.guardianConsentProofUrl,

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
