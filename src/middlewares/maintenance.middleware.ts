import type { Request, Response, NextFunction } from "express";
import { settingsService } from "../modules/settings/services/settings.service";
import { logger } from "../lib/logger";

/**
 * Chemins autorisés même en maintenance avancée pour permettre à l'administrateur
 * de s'authentifier et au système de santé de fonctionner.
 */
const EXEMPT_PATHS = [
  "/health",
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/settings/public",
];

export const maintenanceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await settingsService.getSettings();

    // Si aucune maintenance n'est active, on continue normalement
    if (!settings.maintenanceMode) {
      return next();
    }

    // Un administrateur connecté a TOUJOURS accès à toutes les interfaces (admin & client)
    if (req.user && req.user.role === "ADMIN") {
      return next();
    }

    // Autoriser les routes d'authentification pour permettre la connexion d'un admin
    const currentPath = req.path;
    const isExempt = EXEMPT_PATHS.some((path) => currentPath.endsWith(path) || currentPath.includes(path));
    if (isExempt) {
      return next();
    }

    // Si l'option avancée de maintenance est activée :
    // Tout utilisateur non-admin doit être impérativement DÉCONNECTÉ
    if (settings.advancedMaintenance) {
      // Effacer les cookies de session pour forcer la déconnexion
      if (req.cookies?.accessToken || req.cookies?.refreshToken) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
      }

      req.user = undefined;

      logger.info(
        { ip: req.ip, path: req.path },
        "Maintenance avancée active : déconnexion forcée et accès bloqué"
      );

      res.status(503).json({
        success: false,
        error: {
          code: "MAINTENANCE_MODE_STRICT",
          message: settings.maintenanceMessage || "Le site est actuellement en maintenance avancée. Vous avez été déconnecté.",
          forcedLogout: true,
          maintenance: true,
        },
      });
      return;
    }

    // Mode maintenance standard
    res.status(503).json({
      success: false,
      error: {
        code: "MAINTENANCE_MODE",
        message: settings.maintenanceMessage || "Le site est actuellement en maintenance.",
        forcedLogout: false,
        maintenance: true,
      },
    });
  } catch (_error) {
    // Si la base ou le singleton est indisponible, laisser passer pour ne pas bloquer les routes de secours
    next();
  }
};
