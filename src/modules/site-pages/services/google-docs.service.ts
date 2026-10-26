import axios from "axios";
import { BadRequestError } from "../../../errors/AppError";
import { logger } from "../../../lib/logger";

export interface GoogleDocContentResult {
  docId: string;
  content: string;
  title?: string;
  rawUrl: string;
}

export class GoogleDocsService {
  /**
   * Extrait le docId d'une URL Google Docs ou Google Drive
   */
  public extractDocId(url: string): string | null {
    if (!url || typeof url !== "string") return null;

    // Formats supportés:
    // https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
    // https://docs.google.com/document/u/1/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/pub
    // https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view
    const docRegex = /docs\.google\.com\/document\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/i;
    const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;

    const docMatch = url.match(docRegex);
    if (docMatch?.[1]) return docMatch[1];

    const driveMatch = url.match(driveRegex);
    if (driveMatch?.[1]) return driveMatch[1];

    return null;
  }

  /**
   * Récupère le contenu textuel d'un Google Doc accessible publiquement ou par lien partagé
   */
  public async fetchDocContent(url: string): Promise<GoogleDocContentResult> {
    const docId = this.extractDocId(url);
    if (!docId) {
      throw new BadRequestError(
        "URL Google Docs invalide. Format attendu : https://docs.google.com/document/d/{ID}/edit"
      );
    }

    try {
      // 1. Tenter l'export texte direct (format le plus propre)
      const exportTxtUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const response = await axios.get(exportTxtUrl, {
        timeout: 10000,
        responseType: "text",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) LureviaECommerce/1.0",
        },
      });

      let content = typeof response.data === "string" ? response.data : String(response.data);

      // Si Google renvoie une page d'authentification ou redirection HTML
      if (content.includes("<!DOCTYPE html>") || content.includes("<html")) {
        // Tenter via la page de publication web
        const pubUrl = `https://docs.google.com/document/d/${docId}/pub`;
        try {
          const pubResponse = await axios.get(pubUrl, { timeout: 8000, responseType: "text" });
          const htmlContent = pubResponse.data as string;
          // Nettoyer les balises HTML basiques
          content = this.cleanHtmlToText(htmlContent);
        } catch {
          throw new BadRequestError(
            "Le document Google Docs n'est pas accessible. Assurez-vous d'avoir configuré le partage sur « Tous les utilisateurs disposant du lien peuvent lire »."
          );
        }
      }

      content = content.trim();
      if (!content) {
        throw new BadRequestError("Le contenu du document Google Docs est vide.");
      }

      // Extraire un titre probable depuis la première ligne si pertinent
      const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
      const title = lines[0] ? lines[0].slice(0, 150) : undefined;

      return {
        docId,
        content,
        title,
        rawUrl: url,
      };
    } catch (err: unknown) {
      if (err instanceof BadRequestError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      logger.warn({ docId, error: message }, "Échec de récupération Google Docs");
      throw new BadRequestError(
        "Impossible de lire le Google Docs. Vérifiez que le lien est public (« Tous les utilisateurs disposant du lien ») ou publiez-le sur le web."
      );
    }
  }

  private cleanHtmlToText(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
}

export const googleDocsService = new GoogleDocsService();
