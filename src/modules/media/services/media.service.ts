import axios from "axios";
import { env } from "../../../config/env";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../errors/AppError";
import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { allowedTypes, assertImageSignature, assertPublicUrl, dataUrlPattern } from "../lib/media-security";
import { storeBytes } from "../lib/media-storage";

export class MediaService {
    async uploadDataUrl(ownerId: string, dataUrl: string) {
        const match = dataUrlPattern.exec(dataUrl);
        if (!match) {
            throw new BadRequestError("Un data URL image valide est requis");
        }
        const contentType = match[1];
        const encoded = match[2];

        if (encoded.length > Math.ceil((env.MEDIA_MAX_BYTES * 4) / 3) + 8) {
            throw new BadRequestError("La taille de l'image dépasse la limite autorisée");
        }

        const bytes = Buffer.from(encoded, "base64");
        if (!bytes.length || bytes.length > env.MEDIA_MAX_BYTES) {
            throw new BadRequestError("La taille de l'image dépasse la limite autorisée");
        }

        assertImageSignature(bytes, contentType);
        return storeBytes(ownerId, bytes, contentType, "direct-upload");
    }

    async importFromUrl(ownerId: string, sourceUrl: string) {
        const url = await assertPublicUrl(sourceUrl);

        let response;
        try {
            response = await axios.get<ArrayBuffer>(url.toString(), {
                responseType: "arraybuffer",
                timeout: 15000,
                maxContentLength: env.MEDIA_MAX_BYTES,
                maxBodyLength: env.MEDIA_MAX_BYTES,
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 300,
            });
        } catch (error) {
            throw new BadRequestError(
                axios.isAxiosError(error) && error.response?.status === 404
                    ? "L'image source est introuvable"
                    : "Impossible de télécharger l'image source"
            );
        }

        const contentType = String(response.headers["content-type"] ?? "")
            .split(";")[0]
            .trim()
            .toLowerCase();

        if (!allowedTypes[contentType]) {
            throw new BadRequestError("Le serveur source ne fournit pas un type image autorisé");
        }

        const bytes = Buffer.from(response.data);
        if (!bytes.length || bytes.length > env.MEDIA_MAX_BYTES) {
            throw new BadRequestError("La taille de l'image dépasse la limite autorisée");
        }

        assertImageSignature(bytes, contentType);
        return storeBytes(ownerId, bytes, contentType, url.toString());
    }

    async list(ownerId: string, page?: number, limit?: number) {
        const pagination = normalizePagination(page, limit);
        const [items, totalItems] = await prisma.$transaction([
            prisma.mediaAsset.findMany({
                where: { ownerId },
                orderBy: { createdAt: "desc" },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            }),
            prisma.mediaAsset.count({ where: { ownerId } }),
        ]);

        const mapped = items.map((m) => ({
            id: m.id,
            publicUrl: m.publicUrl,
            contentType: m.contentType,
            byteSize: m.byteSize,
            createdAt: m.createdAt,
        }));

        return buildPaginatedResult(mapped, totalItems, pagination);
    }

    async remove(mediaId: string, ownerId: string) {
        const asset = await prisma.mediaAsset.findUnique({
            where: { id: mediaId },
        });
        if (!asset) throw new NotFoundError("Média");
        if (asset.ownerId !== ownerId) {
            throw new ForbiddenError("Ce média ne vous appartient pas.");
        }

        if (env.GITHUB_MEDIA_TOKEN && asset.githubSha) {
            try {
                const apiUrl = `https://api.github.com/repos/${encodeURIComponent(
                    env.GITHUB_MEDIA_OWNER
                )}/${encodeURIComponent(
                    env.GITHUB_MEDIA_REPO
                )}/contents/${asset.githubPath
                    .split("/")
                    .map(encodeURIComponent)
                    .join("/")}`;
                await axios.delete(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${env.GITHUB_MEDIA_TOKEN}`,
                        Accept: "application/vnd.github+json",
                    },
                    data: {
                        message: `Delete media ${asset.githubPath}`,
                        sha: asset.githubSha,
                        branch: env.GITHUB_MEDIA_BRANCH,
                    },
                    timeout: 10000,
                });
            } catch (err) {
                logger.warn(
                    { err, mediaId },
                    "Impossible de supprimer le média sur GitHub (orphelin)"
                );
            }
        }

        await prisma.mediaAsset.delete({ where: { id: mediaId } });
    }
}

export const mediaService = new MediaService();
