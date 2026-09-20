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
};
