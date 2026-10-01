import { type RawUserRow } from "../lib/type/admin.type";

export class AdminUserMapper {
  toOutput(u: RawUserRow) {
    return {
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
    };
  }

  toOutputList(items: RawUserRow[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const adminUserMapper = new AdminUserMapper();
