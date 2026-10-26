import { describe, expect, it } from "vitest";
import { googleDocsService } from "../../../../src/modules/site-pages/services/google-docs.service";

describe("GoogleDocsService", () => {
  it("extracts document id from standard Google Docs URL", () => {
    const url = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
    expect(googleDocsService.extractDocId(url)).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
  });

  it("extracts document id from published web URL", () => {
    const url = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/pub";
    expect(googleDocsService.extractDocId(url)).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
  });

  it("extracts document id from Drive file URL", () => {
    const url = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view";
    expect(googleDocsService.extractDocId(url)).toBe("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
  });

  it("returns null for invalid or empty URLs", () => {
    expect(googleDocsService.extractDocId("https://example.com/other-doc")).toBeNull();
    expect(googleDocsService.extractDocId("")).toBeNull();
  });
});
