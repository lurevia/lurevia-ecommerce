import type { NextFunction, Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { ForbiddenError, UnauthorizedError } from "../../../../src/errors/AppError";
import { requirePrimaryAdmin } from "../../../../src/middlewares/auth.middleware";

const authorize = (user?: Request["user"]) => {
  let receivedError: unknown;
  let continued = false;
  const next = ((error?: unknown) => {
    receivedError = error;
    continued = error === undefined;
  }) as NextFunction;

  requirePrimaryAdmin({ user } as Request, {} as Response, next);
  return { receivedError, continued };
};

describe("requirePrimaryAdmin", () => {
  it("allows the primary administrator", () => {
    const result = authorize({
      id: "admin-id",
      role: "ADMIN",
      isVerified: true,
      isPrimaryAdmin: true,
    });
    expect(result.continued).toBe(true);
    expect(result.receivedError).toBeUndefined();
  });

  it("rejects other administrators", () => {
    const result = authorize({
      id: "admin-id",
      role: "ADMIN",
      isVerified: true,
      isPrimaryAdmin: false,
    });
    expect(result.receivedError).toBeInstanceOf(ForbiddenError);
  });

  it("rejects unauthenticated requests", () => {
    const result = authorize();
    expect(result.receivedError).toBeInstanceOf(UnauthorizedError);
  });
});