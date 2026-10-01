import { issueTokenPair } from "../helper/auth.helper";

export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  hasPassword: boolean;
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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface OAuthProfile {
  providerUserId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  phone: string | null;
}

export interface AuthResult {
  user: PublicUser;
  tokens: Awaited<ReturnType<typeof issueTokenPair>>;
  needsProfileCompletion: boolean;
}
