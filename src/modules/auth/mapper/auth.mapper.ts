import type { User } from "@prisma/client";
import { type PublicUser } from "../lib/type/auth.type";

export class AuthMapper {
  toOutput(user: User): PublicUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      hasPassword: Boolean(user.passwordHash),
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      age: user.age,
      gender: user.gender,
      role: user.role,
      isVerified: user.isVerified,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      primaryProvider: user.primaryProvider,
      identityVerificationStatus: user.identityVerificationStatus,
      isMinor: user.isMinor,
      createdAt: user.createdAt,
    };
  }

}

export const authMapper = new AuthMapper();
