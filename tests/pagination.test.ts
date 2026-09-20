import { describe, expect, it } from "vitest";
import { buildPaginatedResult, normalizePagination } from "../src/utils/pagination";

describe("normalizePagination", () => {
  it("applique les valeurs par défaut quand rien n'est fourni", () => {
    expect(normalizePagination(undefined, undefined)).toEqual({ page: 1, limit: 12 });
  });

  it("rejette les pages négatives ou nulles", () => {
    expect(normalizePagination(-5, 10)).toEqual({ page: 1, limit: 10 });
    expect(normalizePagination(0, 10)).toEqual({ page: 1, limit: 10 });
  });

  it("plafonne la limite au maximum autorisé", () => {
    expect(normalizePagination(1, 9999)).toEqual({ page: 1, limit: 60 });
  });
});

describe("buildPaginatedResult", () => {
  it("calcule correctement les métadonnées de pagination", () => {
    const result = buildPaginatedResult(["a", "b"], 25, { page: 2, limit: 10 });
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      totalItems: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("indique l'absence de page suivante sur la dernière page", () => {
    const result = buildPaginatedResult([], 20, { page: 2, limit: 10 });
    expect(result.pagination.hasNextPage).toBe(false);
  });
});
