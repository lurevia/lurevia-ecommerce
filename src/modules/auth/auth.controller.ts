import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { oauthService } from "./oauth.service";
import {
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
} from "../../utils/cookies";
import { UnauthorizedError } from "../../errors/AppError";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../utils/apiResponse";

export const authController = {
  // ═════════════════════════════════════════════════════════════════════════
  // LOGIN LOCAL (email/téléphone + mot de passe)
  // ═════════════════════════════════════════════════════════════════════════

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(req.body, req.ip);
    setRefreshTokenCookie(
      res,
      tokens.refreshToken,
      tokens.refreshTokenExpiresAt
    );
    sendSuccess(res, { user, accessToken: tokens.accessToken });
  }),

  // ═════════════════════════════════════════════════════════════════════════
  // SESSION
  // ═════════════════════════════════════════════════════════════════════════

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!rawToken) throw new UnauthorizedError("Aucune session à renouveler.");

    const { user, tokens } = await authService.refresh(rawToken, req.ip);
    setRefreshTokenCookie(
      res,
      tokens.refreshToken,
      tokens.refreshTokenExpiresAt
    );
    sendSuccess(res, { user, accessToken: tokens.accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logout(rawToken);
    clearRefreshTokenCookie(res);
    sendNoContent(res);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);
    sendSuccess(res, { user });
  }),

  // ═════════════════════════════════════════════════════════════════════════
  // OAUTH (Google OU Facebook)
  // ═════════════════════════════════════════════════════════════════════════

  oauthCallback: asyncHandler(async (req: Request, res: Response) => {
    const result = await oauthService.authenticateWithOAuth(
      req.body.provider,
      req.body.token,
      req.ip
    );
    setRefreshTokenCookie(
      res,
      result.tokens.refreshToken,
      result.tokens.refreshTokenExpiresAt
    );
    sendSuccess(res, {
      user: result.user,
      accessToken: result.tokens.accessToken,
      needsProfileCompletion: result.needsProfileCompletion,
    });
  }),


  requestVerification: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.requestVerification(req.user!.id);
    sendCreated(res, result);
  }),

  verificationStatus: asyncHandler(async (req: Request, res: Response) => {
    const status = await authService.getVerificationStatus(req.user!.id);
    sendSuccess(res, status);
  }),
};