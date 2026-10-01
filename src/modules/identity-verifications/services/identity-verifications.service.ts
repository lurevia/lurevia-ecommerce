import { identityVerificationsRepository, type IdentityVerificationsRepository } from "../repository/identity-verifications.repository";
import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import type { ListMyVerificationsQuery, SubmitVerificationInput } from "../dto";
import { identityVerificationsMapper } from "../mapper/identity-verifications.mapper";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class IdentityVerificationsService {
    constructor(
        private readonly repository: IdentityVerificationsRepository
    ) { }

    /**
     * Soumet une nouvelle demande de vérification (CIN ou tuteur).
     * - Un utilisateur ne peut pas avoir 2 demandes PENDING simultanées.
     * - Refuse si l'utilisateur est déjà vérifié.
     */
    async submit(userId: string, input: SubmitVerificationInput) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isVerified: true, isMinor: true },
        });
        if (!user) throw new NotFoundError("Utilisateur");

        if (user.isVerified) {
            throw new ConflictError("Votre identité est déjà vérifiée.");
        }

        // Pas de doublon PENDING
        const pending = await this.repository.findPendingForUser(userId);
        if (pending) {
            throw new ConflictError(
                "Vous avez déjà une demande de vérification en cours de traitement."
            );
        }

        // Vérifie que le CIN n'est pas déjà utilisé par un autre compte
        if (!input.isGuardianVerification && input.cinNumber) {
            const existing = await prisma.user.findFirst({
                where: {
                    cinNumber: input.cinNumber,
                    id: { not: userId },
                },
                select: { id: true },
            });
            if (existing) {
                throw new ConflictError("Ce numéro CIN est déjà associé à un autre compte.");
            }
        }

        const verification = await this.repository.create({
            user: { connect: { id: userId } },
            isGuardianVerification: input.isGuardianVerification,

            // Personnel
            documentType: input.documentType,
            documentNumber: input.documentNumber,
            documentUrl: input.documentUrl,
            documentUrlBack: input.documentUrlBack,
            selfieUrl: input.selfieUrl,
            cinNumber: input.cinNumber,

            // Tuteur
            guardianFullName: input.guardianFullName,
            guardianCinNumber: input.guardianCinNumber,
            guardianRelation: input.guardianRelation,
            guardianCinDocumentUrl: input.guardianCinDocumentUrl,
            guardianPhone: input.guardianPhone,
            guardianConsentProofUrl: input.guardianConsentProofUrl,
        });

        // Notifie les admins
        await prisma.adminNotification.create({
            data: {
                type: input.isGuardianVerification
                    ? "GUARDIAN_CIN_VERIFICATION_REQUEST"
                    : "CIN_VERIFICATION_REQUEST",
                title: "Nouvelle demande de vérification d'identité",
                message: input.isGuardianVerification
                    ? `Demande de vérification par tuteur (${input.guardianFullName}).`
                    : `Demande de vérification CIN.`,
                entityType: "IdentityVerification",
                entityId: verification.id,
                actorUserId: userId,
            },
        });

        logger.info(
            { userId, verificationId: verification.id, isGuardian: input.isGuardianVerification },
            "Nouvelle demande de vérification d'identité"
        );

        return identityVerificationsMapper.toOutput(verification);
    }

    /**
     * Liste les demandes de l'utilisateur connecté (paginated).
     */
    async listMine(userId: string, query: ListMyVerificationsQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [items, totalItems] = await this.repository.findManyByUser(
            userId,
            (pagination.page - 1) * pagination.limit,
            pagination.limit,
            query.status
        );
        return buildPaginatedResult(
            identityVerificationsMapper.toOutputList(items),
            totalItems,
            pagination
        );
    }

    /**
     * Détail d'une demande (vérifie l'ownership).
     */
    async getById(userId: string, verificationId: string) {
        const verification = await this.repository.findById(verificationId);
        if (!verification) throw new NotFoundError("Vérification");
        if (verification.userId !== userId) {
            throw new ForbiddenError("Cette vérification ne vous appartient pas.");
        }
        return identityVerificationsMapper.toOutput(verification);
    }

    /**
     * Annule une demande PENDING (l'utilisateur peut retirer sa demande).
     */
    async cancel(userId: string, verificationId: string) {
        const verification = await this.repository.findById(verificationId);
        if (!verification) throw new NotFoundError("Vérification");
        if (verification.userId !== userId) {
            throw new ForbiddenError("Cette vérification ne vous appartient pas.");
        }
        if (verification.status !== "PENDING") {
            throw new ConflictError(
                "Seule une demande en attente peut être annulée."
            );
        }

        await this.repository.delete(verificationId);
        logger.info({ userId, verificationId }, "Vérification annulée");
    }

    /**
     * Statut actuel de la vérification (pour affichage front).
     */
    async getStatus(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                isVerified: true,
                isMinor: true,
                cinVerifiedAt: true,
                guardianCinVerifiedAt: true,
                identityVerificationStatus: true,
            },
        });
        if (!user) throw new NotFoundError("Utilisateur");

        const pending = await this.repository.findPendingForUser(userId);

        return {
            isVerified: user.isVerified,
            isMinor: user.isMinor,
            status: user.identityVerificationStatus,
            cinVerifiedAt: user.cinVerifiedAt,
            guardianCinVerifiedAt: user.guardianCinVerifiedAt,
            pendingRequest: pending
                ? { id: pending.id, submittedAt: pending.submittedAt }
                : null,
        };
    }
}

export const identityVerificationsService = new IdentityVerificationsService(identityVerificationsRepository);
