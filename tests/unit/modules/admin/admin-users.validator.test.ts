import { describe, expect, it } from "vitest";
import { listUsersQuerySchema } from "../../../../src/modules/admin/validator/admin.validator";

describe("listUsersQuerySchema", () => {
  it.each([
    ["createdAt", "DESC"],
    ["fullName", "ASC"],
    ["ordersCount", "DESC"],
  ] as const)("accepts sorting by %s in %s order", (sortField, sortOrder) => {
    expect(listUsersQuerySchema.parse({ sortField, sortOrder })).toMatchObject({
      sortField,
      sortOrder,
    });
  });

  it("rejects unsupported sort fields", () => {
    expect(() =>
      listUsersQuerySchema.parse({ sortField: "email", sortOrder: "ASC" })
    ).toThrow();
  });
});
