// src/modules/media/storage/local-storage.adapter.ts
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { MediaArchiveStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";
import { ConflictError } from "../../../errors/AppError";
import { env } from "../../../config/env";
import { allowedTypes, MAX_MEDIA_PER_USER } from "../lib/media-security";
import type {
  MediaStorageAdapter,
  StoredMedia,
} from "../lib/types/media-storage.interface";

/**
 * Stockage LOCAL — écrit les fichiers dans ./uploads/.
 * Servi en statique par Express sur /uploads/...
 *
 * ⚠️ Utilisé UNIQUEMENT en développement (Render bloque l'écriture persistante).
 */
export class LocalStorageAdapter implements MediaStorageAdapter {
  private readonly uploadDir = resolve(process.cwd(), "uploads");

  async store(
    ownerId: string,
    bytes: Buffer,
    contentType: string,
    sourceUrl: string
  ): Promise<StoredMedia> {
    await this.assertQuota(ownerId);

    const extension = allowedTypes[contentType];
    const dateFolder = new Date().toISOString().slice(0, 10);
    const fileName = `${randomUUID()}.${extension}`;
    const relativePath = `${dateFolder}/${fileName}`;
    const absoluteFolder = join(this.uploadDir, dateFolder);
    const absolutePath = join(absoluteFolder, fileName);

    await mkdir(absoluteFolder, { recursive: true });
    await writeFile(absolutePath, bytes);

    const publicUrl = `${env.APP_URL}/uploads/${relativePath}`;

    const asset = await prisma.mediaAsset.create({
      data: {
        ownerId,
        sourceUrl,
        publicUrl,
        githubPath: relativePath, // Réutilise le champ pour le chemin relatif
        contentType,
        byteSize: bytes.length,
        githubSha: null,
        googleArchiveStatus: MediaArchiveStatus.NOT_CONFIGURED,
        googleArchiveError: null,
      },
    });

    logger.info(
      { mediaId: asset.id, ownerId, size: bytes.length, storage: "local" },
      "Média stocké localement"
    );

    return {
      id: asset.id,
      publicUrl,
      contentType,
      byteSize: bytes.length,
      googleArchiveStatus: asset.googleArchiveStatus,
    };
  }

  async delete(mediaId: string, storagePath: string): Promise<void> {
    const absolutePath = join(this.uploadDir, storagePath);
    try {
      await unlink(absolutePath);
    } catch (error) {
      logger.warn(
        { err: error, mediaId, path: absolutePath },
        "Fichier local introuvable (orphelin)"
      );
    }
    await prisma.mediaAsset.delete({ where: { id: mediaId } });
  }

  private async assertQuota(ownerId: string): Promise<void> {
    const count = await prisma.mediaAsset.count({ where: { ownerId } });
    if (count >= MAX_MEDIA_PER_USER) {
      throw new ConflictError(
        `Limite atteinte : ${MAX_MEDIA_PER_USER} médias maximum par utilisateur.`
      );
    }
  }
}