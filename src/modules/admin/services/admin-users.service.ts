import { prisma } from "../../../lib/prisma";
import type { Role } from "@prisma/client";
import { adminRepository, type AdminRepository } from "../repository/admin.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { hashPassword } from "../../../utils/password";
import type { CreateAdminInput, ListUsersQuery, SellerListQuery } from "../dto";
import { adminUserMapper } from "../mapper/admin-users.mapper";

export class AdminUsersService {
    constructor(
        private readonly repository: AdminRepository
    ) { }

    async listUsers(query: ListUsersQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [users, totalItems] = await this.repository.findManyUsers({
            skip: (pagination.page - 1) * pagination.limit,
            take: pagination.limit,
            search: query.search,
            role: query.role,
            gender: query.gender,
            age: query.age,
            sortField: query.sortField ?? "createdAt",
            sortOrder: query.sortOrder ?? "DESC",
        });
        return buildPaginatedResult(adminUserMapper.toOutputList(users), totalItems, pagination);
    }

    async getUser(id: string) {
        const user = await this.repository.findUserById(id);
        if (!user) throw new NotFoundError("Utilisateur");
        return adminUserMapper.toOutput(user);
    }

    async listSellers(query: SellerListQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const where = {
            role: "SELLER" as const,
            ...(query.status === "active" ? { isActive: true, isVerified: true } : {}),
            ...(query.status === "pending"
                ? { isActive: true, isVerified: false }
                : {}),
            ...(query.status === "suspended" ? { isActive: false } : {}),
            ...(query.search
                ? {
                    OR: [
                        { fullName: { contains: query.search, mode: "insensitive" as const } },
                        { boutique: { name: { contains: query.search, mode: "insensitive" as const } } },
                        { email: { contains: query.search, mode: "insensitive" as const } },
                        { phone: { contains: query.search, mode: "insensitive" as const } },
                    ],
                }
                : {}),
        };

        const [users, totalItems] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                include: {
                    boutique: { select: { name: true } },
                    sellerContracts: {
                        orderBy: { version: "desc" },
                        take: 1,
                        select: { type: true, value: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            }),
            prisma.user.count({ where }),
        ]);

        const items = users.map((user) => ({
            id: user.id,
            name: user.boutique?.name ?? user.fullName,
            sellerName: user.fullName,
            email: user.email,
            phone: user.phone,
            commissionRate:
                user.sellerContracts[0]?.type === "PERCENTAGE"
                    ? user.sellerContracts[0].value
                    : null,
            status: !user.isActive
                ? "suspended"
                : user.isVerified
                    ? "active"
                    : "pending",
            createdAt: user.createdAt.toISOString(),
        }));

        return buildPaginatedResult(items, totalItems, pagination);
    }

    async updateUserRole(id: string, role: Role) {
        const user = await this.repository.findUserById(id);
        if (!user) throw new NotFoundError("Utilisateur");
        if (role === "SELLER" && !user.isVerified) {
            throw new ForbiddenError("Un compte doit être vérifié avant de devenir vendeur.");
        }
        await this.repository.updateUserRole(id, role);
        const updated = await this.repository.findUserById(id);
        return adminUserMapper.toOutput(updated!);
    }

    async removeUser(id: string, adminId: string) {
        if (id === adminId) {
            throw new ForbiddenError(
                "Un administrateur ne peut pas supprimer son propre compte."
            );
        }
        const user = await this.repository.findUserById(id);
        if (!user) throw new NotFoundError("Utilisateur");
        try {
            await this.repository.deleteUser(id);
        } catch (error) {
            if (hasErrorCode(error, "P2003")) {
                throw new ConflictError(
                    "Ce compte est lié à des commandes ou à des données historiques. Traitez sa demande de suppression/anonymisation à la place."
                );
            }
            throw error;
        }
    }

    async createAdmin(
        input: CreateAdminInput,
        actorUserId: string,
        requestMeta: { ipAddress?: string; userAgent?: string; }
    ) {
        const [emailTaken, phoneTaken] = await Promise.all([
            prisma.user.findUnique({
                where: { email: input.email },
                select: { id: true },
            }),
            prisma.user.findUnique({
                where: { phone: input.phone },
                select: { id: true },
            }),
        ]);
        if (emailTaken) throw new ConflictError("Cet email est déjà utilisé.");
        if (phoneTaken) throw new ConflictError("Ce numéro est déjà utilisé.");

        const passwordHash = await hashPassword(input.password);
        try {
            const user = await prisma.user.create({
                data: {
                    fullName: input.fullName,
                    email: input.email,
                    phone: input.phone,
                    passwordHash,
                    role: "ADMIN",
                    primaryIdentifier: "EMAIL",
                    primaryProvider: "LOCAL",
                    emailVerified: true,
                    phoneVerified: true,
                    isVerified: true,
                    lastLoginAt: null,
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                },
            });

            await prisma.auditLog.create({
                data: {
                    actorUserId,
                    action: "ADMIN_CREATED",
                    entityType: "USER",
                    entityId: user.id,
                    metadata: { email: user.email, role: user.role },
                    ipAddress: requestMeta.ipAddress,
                    userAgent: requestMeta.userAgent,
                },
            });

            return user;
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code: string; }).code === "P2002"
            ) {
                throw new ConflictError("Cet email ou ce numéro est déjà utilisé.");
            }
            throw error;
        }
    }
}

const hasErrorCode = (error: unknown, code: string): boolean =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code;

export const adminUsersService = new AdminUsersService(adminRepository);
