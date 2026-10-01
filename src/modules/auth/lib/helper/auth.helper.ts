import { authRepository } from "../../repository/auth.repository";
import { signAccessToken } from "../../../../utils/jwt";
import { generateRefreshTokenValue, getRefreshTokenExpiry, hashToken } from "../../../../utils/refreshToken";
import { prisma } from "../../../../lib/prisma";
import type { Role } from "@prisma/client";
import { type TokenPair } from "../type/auth.type";

export const issueTokenPair = async (
  userId: string,
  role: Role,
  createdByIp?: string
): Promise<TokenPair> => {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshTokenValue = generateRefreshTokenValue();
  const refreshTokenExpiresAt = getRefreshTokenExpiry();

  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      OR: [
        { expiresAt: { lt: new Date() } },
        {
          revokedAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
  });

  await authRepository.storeRefreshToken({
    tokenHash: hashToken(refreshTokenValue),
    expiresAt: refreshTokenExpiresAt,
    createdByIp,
    user: { connect: { id: userId } },
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    refreshTokenExpiresAt,
  };
};
