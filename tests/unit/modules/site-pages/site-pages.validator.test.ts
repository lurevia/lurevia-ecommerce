import { describe, expect, it } from "vitest";
import {
  createSitePageSchema,
  updateSitePageSchema,
} from "../../../../src/modules/site-pages/dto";

const validPage = {
  slug: "faq",
  title: "Questions fréquentes",
  content: "Contenu administrable",
};

describe("site page validation", () => {
  it("accepts a page and applies optional defaults", () => {
    expect(createSitePageSchema.parse(validPage)).toMatchObject({
      ...validPage,
      summary: "",
      published: false,
      showInFooter: false,
    });
  });

  it("rejects invalid and reserved slugs", () => {
    expect(
      createSitePageSchema.safeParse({ ...validPage, slug: "FAQ !" }).success
    ).toBe(false);
    expect(
      createSitePageSchema.safeParse({
        ...validPage,
        slug: "confidentialite",
      }).success
    ).toBe(false);
  });

  it("requires at least one field when updating", () => {
    expect(updateSitePageSchema.safeParse({}).success).toBe(false);
    expect(updateSitePageSchema.safeParse({ published: true }).success).toBe(true);
  });
});
