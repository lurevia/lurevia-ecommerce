import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../errors/client.errors";
import { settingsService } from "../../settings/services/settings.service";
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

  async create(data: CreateSitePageInput, updatedBy: string) {
    return prisma.$transaction(async (tx) => {
      const page = await tx.sitePage.create({
        data: { ...data, updatedBy },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: updatedBy,
          action: "SITE_PAGE_CREATED",
          entityType: "SitePage",
          entityId: page.id,
          metadata: { slug: page.slug },
        },
      });
      return page;
    });
  }

  async update(id: string, data: UpdateSitePageInput, updatedBy: string) {
    const existing = await prisma.sitePage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Page");

    return prisma.$transaction(async (tx) => {
      const page = await tx.sitePage.update({
        where: { id },
        data: { ...data, updatedBy },
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
