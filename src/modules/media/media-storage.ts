import axios from "axios";
import { randomUUID } from "node:crypto";
import { MediaArchiveStatus } from "@prisma/client";
import { env } from "../../config/env";
import { ConflictError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { allowedTypes, MAX_MEDIA_PER_USER } from "./media-security";

export async function storeBytes(
  ownerId: string,
  bytes: Buffer,
  contentType: string,
  sourceUrl: string
) {
  if (
    !env.GITHUB_MEDIA_TOKEN ||
    !env.GITHUB_MEDIA_OWNER ||
    !env.GITHUB_MEDIA_REPO
  ) {
    throw new ConflictError(
      "Le stockage GitHub des médias n'est pas configuré."
    );
  }

  const count = await prisma.mediaAsset.count({ where: { ownerId } });
  if (count >= MAX_MEDIA_PER_USER) {
    throw new ConflictError(
      `Limite atteinte : ${MAX_MEDIA_PER_USER} médias maximum par utilisateur.`
    );
  }

  const folder = env.GITHUB_MEDIA_PATH.replace(/^\/|\/$/g, "");
  const extension = allowedTypes[contentType];
  const path = `${folder}/${new Date()
    .toISOString()
    .slice(0, 10)}/${randomUUID()}.${extension}`;

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(
    env.GITHUB_MEDIA_OWNER
  )}/${encodeURIComponent(
    env.GITHUB_MEDIA_REPO
  )}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;

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
        timeout: 20000,
      }
    );
  } catch (error) {
    logger.error(
      { err: error, path },
      "Échec de l'upload GitHub"
    );
    throw new ConflictError("Le dépôt GitHub n'a pas accepté le média", {
      provider: axios.isAxiosError(error) ? error.response?.status : undefined,
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
    { mediaId: asset.id, ownerId, size: bytes.length },
    "Média stocké"
  );

  return {
    id: asset.id,
    publicUrl,
    contentType,
    byteSize: bytes.length,
    googleArchiveStatus: asset.googleArchiveStatus,
  };
}
