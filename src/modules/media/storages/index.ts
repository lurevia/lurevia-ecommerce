// src/modules/media/storage/index.ts
import { env } from "../../../config/env";
import { logger } from "../../../lib/logger";
import { LocalStorageAdapter } from "./local-storage.adapter";
import { GitHubStorageAdapter } from "./github-storage.adapter";
import type { MediaStorageAdapter } from "../lib/types/media-storage.interface";

type StorageMode = "local" | "github";

/**
 * Choisit l'adapter de stockage média selon MEDIA_STORAGE.
 *
 * - MEDIA_STORAGE=local  → LocalStorageAdapter (dev, ./uploads)
 * - MEDIA_STORAGE=github → GitHubStorageAdapter (prod)
 * - Non défini           → local en dev, github en prod
 */
function selectStorage(): MediaStorageAdapter {
  const mode: StorageMode =
    (env.MEDIA_STORAGE as StorageMode | undefined) ??
    (env.isProduction ? "github" : "local");

  switch (mode) {
    case "github":
      logger.info("📦 Stockage média : GitHub");
      return new GitHubStorageAdapter();

    case "local":
      logger.info("📦 Stockage média : Local (./uploads)");
      return new LocalStorageAdapter();
  }
}

/**
 * Instance unique de l'adapter de stockage.
 */
export const mediaStorage: MediaStorageAdapter = selectStorage();

export type {
  MediaStorageAdapter,
  StoredMedia,
} from "../lib/types/media-storage.interface";