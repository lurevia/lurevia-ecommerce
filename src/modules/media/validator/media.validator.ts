import { z } from "zod";

const publicHttpUrl = z
    .string()
    .trim()
    .url()
    .refine((value) => {
        try {
            const parsed = new URL(value);
            return (
                (parsed.protocol === "http:" || parsed.protocol === "https:") &&
                !parsed.username &&
                !parsed.password
            );
        } catch {
            return false;
        }
    }, "Une URL HTTP(S) publique est requise");

// ─────────────────────────────────────────────────────────────────────────────
// Upload par URL
// ─────────────────────────────────────────────────────────────────────────────
export const importMediaSchema = z.object({
    url: publicHttpUrl,
});

// ─────────────────────────────────────────────────────────────────────────────
// Upload par data URL
// ⚠️ Aligné avec MEDIA_MAX_BYTES (10 MB par défaut).
//    La limite JSON doit être augmentée pour cette route spécifiquement.
// ─────────────────────────────────────────────────────────────────────────────
export const uploadMediaSchema = z.object({
    // 10 MB en base64 = ~13.4 MB en string
    dataUrl: z.string().min(1).max(14 * 1024 * 1024),
});

// ─────────────────────────────────────────────────────────────────────────────
// Liste des médias
// ─────────────────────────────────────────────────────────────────────────────
export const listMediaQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// Params
// ─────────────────────────────────────────────────────────────────────────────
export const mediaIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de média invalide"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type ImportMediaInput = z.infer<typeof importMediaSchema>;
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
