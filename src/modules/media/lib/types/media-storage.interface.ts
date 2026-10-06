// src/modules/media/lib/types/media-storage.interface.ts
import type { MediaArchiveStatus } from "@prisma/client";

/**
 * Résultat retourné par un adapter après stockage d'un média.
 */
export interface StoredMedia {
  id: string;
  publicUrl: string;
  contentType: string;
  byteSize: number;
  googleArchiveStatus: MediaArchiveStatus;
}

/**
 * Contrat de stockage média.
 *
 * Chaque implémentation (LocalStorage, GitHubStorage, S3Storage...) respecte
 * cette interface. Le service média dépend de l'ABSTRACTION, jamais d'une
 * implémentation concrète (Dependency Inversion Principle).
 */
export interface MediaStorageAdapter {
  /**
   * Stocke un buffer d'image et retourne ses métadonnées.
   *
   * @param ownerId     - Propriétaire du média
   * @param bytes       - Contenu binaire de l'image
   * @param contentType - MIME type validé (image/jpeg, image/png...)
   * @param sourceUrl   - URL d'origine ou "direct-upload"
   */
  store(
    ownerId: string,
    bytes: Buffer,
    contentType: string,
    sourceUrl: string
  ): Promise<StoredMedia>;

  /**
   * Supprime un média existant.
   *
   * @param mediaId    - Identifiant en base
   * @param storagePath - Chemin interne (relatif ou GitHub)
   */
  delete(mediaId: string, storagePath: string): Promise<void>;
}