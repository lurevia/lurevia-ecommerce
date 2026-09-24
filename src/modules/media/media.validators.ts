import { z } from "zod";

export const importMediaSchema = z.object({
  url: z.string().trim().url().refine((value) => {
    try {
      const parsed = new URL(value);
      return (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        !parsed.username && !parsed.password;
    } catch {
      return false;
    }
  }, "Une URL HTTP(S) publique est requise"),
});

export const uploadMediaSchema = z.object({
  dataUrl: z.string().min(1).max(35 * 1024 * 1024),
});
