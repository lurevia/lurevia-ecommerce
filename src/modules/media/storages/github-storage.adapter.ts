// src/modules/media/storage/github-storage.adapter.ts
import axios from "axios";
import { randomUUID } from "node:crypto";
import { MediaArchiveStatus } from "@prisma/client";
import { env } from "../../../config/env";
import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";
import { ConflictError } from "../../../errors/AppError";
import { allowedTypes, MAX_MEDIA_PER_USER } from "../lib/media-security";
import type {
  MediaStorageAdapter,
  StoredMedia,
} from "../lib/types/media-storage.interface";

/**
 * Stockage GITHUB — upload via l'API REST GitHub.
 *
 * URL publique : https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
 * Utilisé en production (aucun stockage disque persistant sur Render).
 */
export class GitHubStorageAdapter implements MediaStorageAdapter {
  async store(
    ownerId: string,
    bytes: Buffer,
    contentType: string,
    sourceUrl: string
  ): Promise<StoredMedia> {
    this.assertConfigured();
    await this.assertQuota(ownerId);

    const path = this.buildRemotePath(contentType);
    const apiUrl = this.buildContentsApiUrl(path);

    let githubResponse;
    try {
      githubResponse = await axios.put(
        apiUrl,
        {
          message: `Import media ${path}`,
          content: bytes.toString("base64"),
          branch: env.GITHUB_MEDIA_BRANCH,
        },
        {
          headers: {
            Authorization: `Bearer ${env.GITHUB_MEDIA_TOKEN}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          timeout: 20_000,
        }
      );
    } catch (error) {
      logger.error({ err: error, path }, "Échec de l'upload GitHub");
      throw new ConflictError("Le dépôt GitHub n'a pas accepté le média", {
        provider: axios.isAxiosError(error)
          ? error.response?.status
          : undefined,
      });
    }

    const githubSha = githubResponse.data?.content?.sha as string | undefined;
    const publicUrl = `https://raw.githubusercontent.com/${env.GITHUB_MEDIA_OWNER}/${env.GITHUB_MEDIA_REPO}/${env.GITHUB_MEDIA_BRANCH}/${path}`;

    const asset = await prisma.mediaAsset.create({
      data: {
        ownerId,
        sourceUrl,
        publicUrl,
        githubPath: path,
        contentType,
        byteSize: bytes.length,
        githubSha,
        googleArchiveStatus: MediaArchiveStatus.NOT_CONFIGURED,
        googleArchiveError: null,
      },
    });

    logger.info(
      { mediaId: asset.id, ownerId, size: bytes.length, storage: "github" },
      "Média stocké sur GitHub"
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
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: mediaId },
    });
    if (!asset) return;

    if (env.GITHUB_MEDIA_TOKEN && asset.githubSha) {
      try {
        const apiUrl = this.buildContentsApiUrl(storagePath);
        await axios.delete(apiUrl, {
          headers: {
            Authorization: `Bearer ${env.GITHUB_MEDIA_TOKEN}`,
            Accept: "application/vnd.github+json",
          },
          data: {
            message: `Delete media ${storagePath}`,
            sha: asset.githubSha,
            branch: env.GITHUB_MEDIA_BRANCH,
          },
          timeout: 10_000,
        });
      } catch (err) {
        logger.warn(
          { err, mediaId },
          "Impossible de supprimer le média GitHub (orphelin)"
        );
      }
    }

    await prisma.mediaAsset.delete({ where: { id: mediaId } });
  }

  // ─── HELPERS PRIVÉS ───

  private assertConfigured(): void {
    if (
      !env.GITHUB_MEDIA_TOKEN ||
      !env.GITHUB_MEDIA_OWNER ||
      !env.GITHUB_MEDIA_REPO
    ) {
      throw new ConflictError(
        "Le stockage GitHub des médias n'est pas configuré."
      );
    }
  }

  private async assertQuota(ownerId: string): Promise<void> {
    const count = await prisma.mediaAsset.count({ where: { ownerId } });
    if (count >= MAX_MEDIA_PER_USER) {
      throw new ConflictError(
        `Limite atteinte : ${MAX_MEDIA_PER_USER} médias maximum par utilisateur.`
      );
    }
  }

  private buildRemotePath(contentType: string): string {
    const folder = env.GITHUB_MEDIA_PATH.replace(/^\/|\/$/g, "");
    const extension = allowedTypes[contentType];
    const dateFolder = new Date().toISOString().slice(0, 10);
    return `${folder}/${dateFolder}/${randomUUID()}.${extension}`;
  }

  private buildContentsApiUrl(path: string): string {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    return `https://api.github.com/repos/${encodeURIComponent(
      env.GITHUB_MEDIA_OWNER
    )}/${encodeURIComponent(env.GITHUB_MEDIA_REPO)}/contents/${encodedPath}`;
  }
}