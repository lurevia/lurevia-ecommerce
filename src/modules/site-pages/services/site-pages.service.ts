import { prisma } from "../../../lib/prisma";
import { NotFoundError, BadRequestError } from "../../../errors/client.errors";
import { settingsService } from "../../settings/services/settings.service";
import { googleDocsService } from "./google-docs.service";
import type {
  CreateSitePageInput,
  UpdateSitePageInput,
} from "../dto";

export class SitePagesService {
  async listPublished() {
    const [pages, settings] = await Promise.all([
      prisma.sitePage.findMany({
        where: { published: true },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          content: true,
          showInFooter: true,
          footerSection: true,
          updatedAt: true,
        },
        orderBy: [{ footerSection: "asc" }, { title: "asc" }],
      }),
      settingsService.getSettings(),
    ]);

    const legalPages = [
      {
        id: "privacy-policy",
        slug: "confidentialite",
        title: "Politique de confidentialité",
        content: settings.privacyPolicy,
      },
      {
        id: "terms-of-service",
        slug: "conditions-generales",
        title: "Conditions générales de vente",
        content: settings.termsOfService,
      },
    ]
      .filter((page) => page.content.trim().length > 0)
      .map((page) => ({
        ...page,
        summary: "",
        showInFooter: true,
        footerSection: "INFORMATION",
        updatedAt: settings.updatedAt,
      }));

    return [...legalPages, ...pages];
  }

  async getPublished(slug: string) {
    const page = await prisma.sitePage.findFirst({
      where: { slug, published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        content: true,
        updatedAt: true,
      },
    });
    if (page) return page;

    const settings = await settingsService.getSettings();
    if (slug === "confidentialite" && settings.privacyPolicy.trim()) {
      return {
        id: "privacy-policy",
        slug: "confidentialite",
        title: "Politique de confidentialité",
        summary: "",
        content: settings.privacyPolicy,
        updatedAt: settings.updatedAt,
      };
    }
    if (slug === "conditions-generales" && settings.termsOfService.trim()) {
      return {
        id: "terms-of-service",
        slug: "conditions-generales",
        title: "Conditions générales de vente",
        summary: "",
        content: settings.termsOfService,
        updatedAt: settings.updatedAt,
      };
    }
    throw new NotFoundError("Page");
  }

  async listAdmin() {
    return prisma.sitePage.findMany({
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });
  }

  async fetchGoogleDoc(url: string) {
    return googleDocsService.fetchDocContent(url);
  }

  async create(data: CreateSitePageInput, updatedBy: string) {
    let contentToSave = data.content ?? "";
    let docFetchedAt: Date | undefined;

    if (data.docUrl) {
      try {
        const fetched = await googleDocsService.fetchDocContent(data.docUrl);
        if (fetched?.content) {
          contentToSave = fetched.content;
          docFetchedAt = new Date();
        }
      } catch {
        // Si la récupération automatique échoue, on conserve le contenu manuel fourni
      }
    }

    return prisma.$transaction(async (tx) => {
      const page = await tx.sitePage.create({
        data: {
          ...data,
          content: contentToSave,
          docFetchedAt,
          updatedBy,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: updatedBy,
          action: "SITE_PAGE_CREATED",
          entityType: "SitePage",
          entityId: page.id,
          metadata: { slug: page.slug, hasDocUrl: Boolean(data.docUrl) },
        },
      });
      return page;
    });
  }

  async update(id: string, data: UpdateSitePageInput, updatedBy: string) {
    const existing = await prisma.sitePage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Page");

    let contentToSave = data.content;
    let docFetchedAt: Date | undefined;

    // Si une nouvelle docUrl est fournie ou modifiée
    if (data.docUrl && data.docUrl !== existing.docUrl) {
      try {
        const fetched = await googleDocsService.fetchDocContent(data.docUrl);
        if (fetched?.content) {
          contentToSave = fetched.content;
          docFetchedAt = new Date();
        }
      } catch {
        // En cas d'erreur de récupération, conserver le contenu envoyé ou existant
      }
    }

    return prisma.$transaction(async (tx) => {
      const page = await tx.sitePage.update({
        where: { id },
        data: {
          ...data,
          ...(contentToSave !== undefined ? { content: contentToSave } : {}),
          ...(docFetchedAt ? { docFetchedAt } : {}),
          updatedBy,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: updatedBy,
          action: "SITE_PAGE_UPDATED",
          entityType: "SitePage",
          entityId: id,
          metadata: { fields: Object.keys(data) },
        },
      });
      return page;
    });
  }

  async syncDoc(id: string, updatedBy: string) {
    const existing = await prisma.sitePage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Page");
    if (!existing.docUrl) throw new BadRequestError("Aucune URL Google Docs configurée pour cette page.");

    const fetched = await googleDocsService.fetchDocContent(existing.docUrl);
    const updated = await prisma.sitePage.update({
      where: { id },
      data: {
        content: fetched.content,
        docFetchedAt: new Date(),
        updatedBy,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: updatedBy,
        action: "SITE_PAGE_DOC_SYNCED",
        entityType: "SitePage",
        entityId: id,
        metadata: { docUrl: existing.docUrl },
      },
    });

    return updated;
  }

  async remove(id: string, updatedBy: string) {
    const existing = await prisma.sitePage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Page");

    await prisma.$transaction(async (tx) => {
      await tx.sitePage.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actorUserId: updatedBy,
          action: "SITE_PAGE_DELETED",
          entityType: "SitePage",
          entityId: id,
          metadata: { slug: existing.slug },
        },
      });
    });
    return { deleted: true };
  }
}

export const sitePagesService = new SitePagesService();
