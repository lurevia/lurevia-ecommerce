import { prisma } from "../../../lib/prisma";
import { adminRepository } from "../admin.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../../errors/AppError";
import { hashPassword } from "../../../utils/password";
import type {
  CreateAdminInput,
  ListUsersQuery,
  SellerListQuery,
} from "../admin.validators";

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
  _count: { orders: number };
}

export const toUserDto = (u: RawUserRow) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email ?? undefined,
  phone: u.phone ?? undefined,
  role: u.role,
  avatarUrl: u.avatarUrl ?? undefined,
  age: u.age ?? undefined,
  gender: u.gender ?? undefined,
  isVerified: u.isVerified,
  isActive: u.isActive,
  ordersCount: u._count.orders,
  createdAt: u.createdAt.toISOString(),
  lastLoginAt: u.lastLoginAt?.toISOString(),
});

export const adminUsersService = {
  async listUsers(query: ListUsersQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [users, totalItems] = await adminRepository.findManyUsers({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      search: query.search,
      role: query.role,
      gender: query.gender,
      age: query.age,
    });
    return buildPaginatedResult(users.map(toUserDto), totalItems, pagination);
  },

  async getUser(id: string) {
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError("Utilisateur");
    return toUserDto(user);
  },

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
      name: user.fullName,
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
  },

  async updateUserRole(id: string, role: "CUSTOMER" | "SELLER" | "ADMIN") {
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError("Utilisateur");
    await adminRepository.updateUserRole(id, role);
    const updated = await adminRepository.findUserById(id);
    return toUserDto(updated!);
  },

  async removeUser(id: string, adminId: string) {
    if (id === adminId) {
      throw new ForbiddenError(
        "Un administrateur ne peut pas supprimer son propre compte."
      );
    }
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError("Utilisateur");
    await adminRepository.deleteUser(id);
  },

  async createAdmin(
    input: CreateAdminInput,
    actorUserId: string,
    requestMeta: { ipAddress?: string; userAgent?: string }
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
        (error as { code: string }).code === "P2002"
      ) {
        throw new ConflictError("Cet email ou ce numéro est déjà utilisé.");
      }
      throw error;
    }
  },
};
