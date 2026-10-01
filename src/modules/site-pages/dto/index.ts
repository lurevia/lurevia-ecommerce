import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .refine(
    (slug) => !["confidentialite", "conditions-generales"].includes(slug),
    "Cette adresse est réservée aux documents légaux."
  );

const footerSectionSchema = z
  .enum(["NAVIGATION", "SERVICES", "INFORMATION"])
  .nullable();

export const createSitePageSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  summary: z.string().max(5000).default(""),
  content: z.string().max(50000).default(""),
  published: z.boolean().default(false),
  showInFooter: z.boolean().default(false),
  footerSection: footerSectionSchema.optional(),
});

export const updateSitePageSchema = createSitePageSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Au moins un champ est requis");

export const sitePageIdSchema = z.object({ id: z.string().uuid() });

export type CreateSitePageInput = z.infer<typeof createSitePageSchema>;
export type UpdateSitePageInput = z.infer<typeof updateSitePageSchema>;
