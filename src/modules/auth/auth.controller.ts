import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { clearRefreshTokenCookie, REFRESH_COOKIE_NAME, setRefreshTokenCookie } from "../../utils/cookies";
import { UnauthorizedError } from "../../errors/AppError";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.register(req.body, req.ip);
    setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
    res.status(201).json({ data: { user, accessToken: tokens.accessToken } });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(req.body, req.ip);
    setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
    res.status(200).json({ data: { user, accessToken: tokens.accessToken } });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!rawToken) throw new UnauthorizedError("Aucune session à renouveler.");

    const { user, tokens } = await authService.refresh(rawToken, req.ip);
    setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
    res.status(200).json({ data: { user, accessToken: tokens.accessToken } });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logout(rawToken);
    clearRefreshTokenCookie(res);
    res.status(204).send();
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);
    res.status(200).json({ data: { user } });
  }),

  requestVerification: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.requestVerification(req.user!.id);
    res.status(201).json({ data: result });
  }),

  confirmVerification: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.confirmVerification(req.user!.id, req.body.code);
    res.status(200).json({ data: result });
  }),

  verificationStatus: asyncHandler(async (req: Request, res: Response) => {
    const status = await authService.getVerificationStatus(req.user!.id);
    res.status(200).json({ data: status });
  }),
};
