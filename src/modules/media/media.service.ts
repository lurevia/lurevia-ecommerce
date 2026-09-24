import axios from "axios";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { randomUUID } from "node:crypto";
import { MediaArchiveStatus } from "@prisma/client";
import { env } from "../../config/env";
import { BadRequestError, ConflictError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp",
};

const isPrivateAddress = (address: string): boolean => {
  const value = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (isIP(value) === 4) {
    const [a, b] = value.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  return value === "::1" || value === "::" || /^(fc|fd|fe[89ab])/.test(value) ||
    /^::ffff:(10|127|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(value);
};

const assertPublicUrl = async (value: string): Promise<URL> => {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new BadRequestError("Seules les URLs HTTP(S) publiques sont acceptées");
  }
  let addresses: { address: string }[];
  try {
    addresses = isIP(url.hostname) ? [{ address: url.hostname }] :
      await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw new BadRequestError("Le nom d'hôte de cette URL est introuvable");
  }
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new BadRequestError("La cible de cette URL n'est pas une adresse publique");
  }
  return url;
};

const assertImageSignature = (bytes: Buffer, contentType: string): void => {
  const valid = (contentType === "image/jpeg" && bytes.length > 3 &&
    bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    (contentType === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (contentType === "image/gif" && /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString("ascii"))) ||
    (contentType === "image/webp" && bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP");
  if (!valid) throw new BadRequestError("Le contenu téléchargé n'est pas une image valide");
};

export const mediaService = {
  async importFromUrl(ownerId: string, sourceUrl: string) {
    const url = await assertPublicUrl(sourceUrl);
    let response;
    try {
      response = await axios.get<ArrayBuffer>(url.toString(), {
        responseType: "arraybuffer", timeout: 15000, maxContentLength: env.MEDIA_MAX_BYTES,
        maxBodyLength: env.MEDIA_MAX_BYTES, maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 300,
      });
    } catch (error) {
      throw new BadRequestError(axios.isAxiosError(error) && error.response?.status === 404
        ? "L'image source est introuvable"
        : "Impossible de télécharger l'image source");
    }
    const contentType = String(response.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
    const extension = allowedTypes[contentType];
    if (!extension) throw new BadRequestError("Le serveur source ne fournit pas un type image autorisé");
    const bytes = Buffer.from(response.data);
    if (bytes.length === 0 || bytes.length > env.MEDIA_MAX_BYTES) {
      throw new BadRequestError("La taille de l'image dépasse la limite autorisée");
    }
    assertImageSignature(bytes, contentType);
    if (!env.MEDIA_GITHUB_TOKEN || !env.MEDIA_GITHUB_OWNER || !env.MEDIA_GITHUB_REPOSITORY) {
      throw new ConflictError("Le stockage GitHub des médias n'est pas configuré");
    }
    const folder = env.MEDIA_GITHUB_PATH.replace(/^\/|\/$/g, "");
    const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(env.MEDIA_GITHUB_OWNER)}/${encodeURIComponent(env.MEDIA_GITHUB_REPOSITORY)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
    let githubResponse;
    try {
      githubResponse = await axios.put(apiUrl, {
        message: `Import media ${path}`, content: bytes.toString("base64"), branch: env.MEDIA_GITHUB_BRANCH,
      }, { headers: {
        Authorization: `Bearer ${env.MEDIA_GITHUB_TOKEN}`, Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      }, timeout: 20000 });
    } catch (error) {
      throw new ConflictError("Le dépôt GitHub n'a pas accepté le média", {
        provider: axios.isAxiosError(error) ? error.response?.status : undefined,
      });
    }
    const githubSha = githubResponse.data?.content?.sha as string | undefined;
    const publicUrl = `https://raw.githubusercontent.com/${env.MEDIA_GITHUB_OWNER}/${env.MEDIA_GITHUB_REPOSITORY}/${env.MEDIA_GITHUB_BRANCH}/${path}`;
    const hasPhotosCredentials = Boolean(env.GOOGLE_PHOTOS_ACCESS_TOKEN);
    const asset = await prisma.mediaAsset.create({
      data: {
        ownerId, sourceUrl: url.toString(), publicUrl, githubPath: path, contentType,
        byteSize: bytes.length, githubSha,
        googleArchiveStatus: hasPhotosCredentials ? MediaArchiveStatus.PENDING : MediaArchiveStatus.NOT_CONFIGURED,
        googleArchiveError: hasPhotosCredentials
          ? "Archivage Google Photos en attente d'un worker OAuth configuré"
          : "Identifiants Google Photos non configurés",
      },
    });
    return { id: asset.id, publicUrl, contentType, byteSize: bytes.length, googleArchiveStatus: asset.googleArchiveStatus };
  },
};
