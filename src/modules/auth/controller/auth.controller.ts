import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { authService, type AuthService } from "../services/auth.service";
import { oauthService, type OAuthService } from "../services/oauth.service";
import { clearRefreshTokenCookie, REFRESH_COOKIE_NAME, setRefreshTokenCookie } from "../../../utils/cookies";
import { UnauthorizedError } from "../../../errors/AppError";
import { sendSuccess, sendCreated, sendNoContent } from "../../../utils/apiResponse";

export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly oauthService: OAuthService
    ) { }

    // ═════════════════════════════════════════════════════════════════════════
    // Inscription et connexion par email
    // ═════════════════════════════════════════════════════════════════════════

    register = asyncHandler(async (req: Request, res: Response) => {
        const { user, tokens } = await this.authService.register(req.body, req.ip);
        setRefreshTokenCookie(
            res,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt
        );
        sendCreated(res, { user, accessToken: tokens.accessToken });
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const { user, tokens } = await this.authService.login(req.body, req.ip);
        setRefreshTokenCookie(
            res,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt
        );
        sendSuccess(res, { user, accessToken: tokens.accessToken });
    });

    // ═════════════════════════════════════════════════════════════════════════
    // SESSION
    // ═════════════════════════════════════════════════════════════════════════

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
        if (!rawToken) throw new UnauthorizedError("Aucune session à renouveler.");

        const { user, tokens } = await this.authService.refresh(rawToken, req.ip);
        setRefreshTokenCookie(
            res,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt
        );
        sendSuccess(res, { user, accessToken: tokens.accessToken });
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
        await this.authService.logout(rawToken);
        clearRefreshTokenCookie(res);
        sendNoContent(res);
    });

    me = asyncHandler(async (req: Request, res: Response) => {
        const user = await this.authService.getCurrentUser(req.user!.id);
        sendSuccess(res, { user });
    });

    // ═════════════════════════════════════════════════════════════════════════
    // Connexion Facebook
    // ═════════════════════════════════════════════════════════════════════════

    oauthCallback = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.oauthService.authenticateWithOAuth(
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
    });

}

export const authController = new AuthController(authService, oauthService);
