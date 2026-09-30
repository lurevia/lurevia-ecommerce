import type { User } from "@prisma/client";

export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  age: number | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  role: "SELLER" | "CUSTOMER" | "ADMIN";
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  primaryProvider: "LOCAL" | "GOOGLE" | "FACEBOOK";
  identityVerificationStatus:
    | "NOT_SUBMITTED"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRED";
  isMinor: boolean;
  createdAt: Date;
};

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
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
});